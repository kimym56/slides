"use client";

import { useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
    resolvePageCurlPerformanceSettings,
    type PageCurlPerformancePreset,
} from "./pageCurlPerformance";
import styles from "./PageCurlProject.module.css";

if (typeof console !== "undefined") {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        const msg = args[0];
        if (typeof msg === "string") {
            if (msg.includes("THREE.Clock:")) return;
            if (msg.includes("THREE.WebGLShadowMap:")) return;
            if (msg.includes("VIDEOJS: WARN:")) return;
        }
        originalWarn(...args);
    };
}

// --- SHADERS ---
const deformChunk = `
vec3 deformPosition(vec3 position, vec2 uSize, float uPeelDist, vec2 uOrigin, vec2 uInward, out vec3 objectNormal, vec3 normal) {
    float R = min(uSize.x, uSize.y) * 0.12; // Bend radius
    
    float dp = dot(position.xy - uOrigin, uInward);
    float fold_pos = uPeelDist / 2.0;
    float d = dp - fold_pos;
    
    float pi = 3.141592653589793;
    
    float new_d = d;
    float z = 0.0;
    float normal_theta = 0.0;
    
    if (uPeelDist <= 0.0) {
        objectNormal = normal;
        return position;
    }
    
    if (d > R) {
        new_d = d;
        z = 0.0;
        normal_theta = 0.0;
    } else if (d > R - pi * R) {
        float arc = R - d;
        float theta = arc / R;
        new_d = R - sin(theta) * R;
        z = R - cos(theta) * R;
        normal_theta = theta;
    } else {
        float remaining = (R - pi * R) - d;
        new_d = R + remaining;
        z = 2.0 * R + d * 0.001; // Tiny slope to prevent z-fighting
        normal_theta = pi;
    }
    
    vec3 transformed = position;
    transformed.x += uInward.x * (new_d - d);
    transformed.y += uInward.y * (new_d - d);
    transformed.z += z;
    
    vec3 axis = vec3(-uInward.y, uInward.x, 0.0);
    float s = sin(normal_theta);
    float c = cos(normal_theta);
    
    // Rodrigues' rotation formula
    objectNormal = normal * c + cross(axis, normal) * s + axis * dot(axis, normal) * (1.0 - c);
    
    return transformed;
}
`;

const shadowDeformChunk = `
vec3 deformShadowPosition(vec3 position, vec2 uSize, float uPeelDist, vec2 uOrigin, vec2 uInward) {
    if (uPeelDist <= 0.0) {
        return position;
    }

    float dp = dot(position.xy - uOrigin, uInward);
    float foldPos = uPeelDist / 2.0;
    float d = dp - foldPos;
    float foldBlend = max(min(uSize.x, uSize.y) * 0.03, 0.02);
    float peeled = 1.0 - smoothstep(-foldBlend, foldBlend, d);
    float reflectedD = mix(d, abs(d), peeled);
    float shadowLift = min(uPeelDist * 0.1, min(uSize.x, uSize.y) * 0.16);

    vec3 transformed = position;
    transformed.x += uInward.x * (reflectedD - d);
    transformed.y += uInward.y * (reflectedD - d);
    transformed.z += shadowLift * peeled;

    return transformed;
}
`;

const vertexShader = `
uniform float uPeelDist;
uniform vec2 uOrigin;
uniform vec2 uInward;
uniform vec2 uSize;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

${deformChunk}

void main() {
    vUv = uv;

    vec3 objectNormal;
    vec3 transformed = deformPosition(position, uSize, uPeelDist, uOrigin, uInward, objectNormal, normal);

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    vNormal = normalize(normalMatrix * objectNormal);
    vViewPosition = -mvPosition.xyz;
}
`;

const fragmentShader = `
uniform sampler2D uTex;
uniform float uOpacity;
uniform vec2 uSize;
uniform vec2 uImageSize;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

float boxSDF(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec2 getCoverUv(vec2 uv) {
    float rs = uSize.x / uSize.y;
    float ri = uImageSize.x / uImageSize.y;
    
    vec2 newUv = uv;
    if (rs > ri) {
        float scale = ri / rs;
        newUv.y = (newUv.y - 0.5) * scale + 0.5;
    } else {
        float scale = rs / ri;
        newUv.x = (newUv.x - 0.5) * scale + 0.5;
    }
    return newUv;
}

void main() {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 b = uSize * 0.5;
    float cornerRadius = min(uSize.x, uSize.y) * 0.03; // Approx 12px
    if (boxSDF(p, b, cornerRadius) > 0.0) {
        discard;
    }

    bool isFront = gl_FrontFacing;
    vec2 mappedUv = isFront ? vUv : vec2(1.0 - vUv.x, vUv.y);
    
    vec2 coverUv = getCoverUv(mappedUv);
    vec4 texColor = texture2D(uTex, coverUv);
    
    vec3 normal = normalize(vNormal);
    if (!isFront) normal = -normal;
    
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0)); 
    
    vec3 ambient = vec3(0.4);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * vec3(0.8);
    
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), isFront ? 16.0 : 64.0); 
    vec3 specular = spec * vec3(0.3);
    
    vec3 finalLight = ambient + diffuse + specular;

    vec4 color = texColor * vec4(finalLight, 1.0);
    
    if (!isFront) {
        vec3 paperWhite = vec3(0.95) * finalLight;
        color = vec4(mix(paperWhite, color.xyz, uOpacity), 1.0);
    }
    
    gl_FragColor = color;
}
`;

function PageComponent({
    peelDist,
    angle,
    meshSegments,
    opacity,
    size,
    liveAngleRadRef,
}: {
    peelDist: number;
    angle: number;
    meshSegments: number;
    opacity: number;
    size: { w: number; h: number };
    liveAngleRadRef: React.MutableRefObject<number>;
}) {
    const texture = useTexture("/images/love-jones-cover.jpg");

    const [uniforms] = useState(() => ({
        uTex: { value: texture },
        uPeelDist: { value: 0.0 },
        uOrigin: { value: new THREE.Vector2() },
        uInward: { value: new THREE.Vector2() },
        uTargetAngleRad: { value: angle * (Math.PI / 180) },
        uOpacity: { value: opacity },
        uSize: { value: new THREE.Vector2(size.w, size.h) },
        uImageSize: { value: new THREE.Vector2(1024, 1024) },
    }));
    const uniformsRef = useRef(uniforms);

    useEffect(() => {
        const uniforms = uniformsRef.current;
        uniforms.uTex.value = texture;
        if (texture && texture.image) {
            const img = texture.image as { width?: number; height?: number };
            uniforms.uImageSize.value.set(img.width || 1024, img.height || 1024);
        }
    }, [texture]);

    useEffect(() => {
        uniformsRef.current.uOpacity.value = opacity;
    }, [opacity]);

    useEffect(() => {
        uniformsRef.current.uSize.value.set(size.w, size.h);
    }, [size.h, size.w]);

    useFrame(() => {
        const uniforms = uniformsRef.current;
        uniforms.uPeelDist.value += (peelDist - uniforms.uPeelDist.value) * 0.2;

        const targetAngleRad = angle * (Math.PI / 180);
        let current = uniforms.uTargetAngleRad.value;
        const delta =
            ((targetAngleRad - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        current += delta * 0.15;
        uniforms.uTargetAngleRad.value = current;
        liveAngleRadRef.current = current;

        const rad = current;
        const dx = Math.cos(rad);
        const dy = -Math.sin(rad);

        const tx = dx !== 0 ? Math.abs(size.w / 2 / dx) : Infinity;
        const ty = dy !== 0 ? Math.abs(size.h / 2 / dy) : Infinity;
        const t = Math.min(tx, ty);

        uniforms.uOrigin.value.set(dx * t, dy * t);
        uniforms.uInward.value.set(-dx, -dy);
    });

    const depthUniforms = useMemo(() => {
        const d = THREE.UniformsUtils.clone(THREE.ShaderLib.depth.uniforms);
        d.uPeelDist = uniforms.uPeelDist;
        d.uOrigin = uniforms.uOrigin;
        d.uInward = uniforms.uInward;
        d.uSize = uniforms.uSize;
        return d;
    }, [uniforms]);

    const depthVertexShader = useMemo(() => {
        let vs = THREE.ShaderLib.depth.vertexShader;
        vs = `
            varying vec2 vMyUv;
            uniform float uPeelDist;
            uniform vec2 uOrigin;
            uniform vec2 uInward;
            uniform vec2 uSize;
            ${shadowDeformChunk}
        ` + vs;
        vs = vs.replace(
            "#include <begin_vertex>",
            `
            vMyUv = uv;
            vec3 transformed = deformShadowPosition(position, uSize, uPeelDist, uOrigin, uInward);
            `
        );
        return vs;
    }, []);

    const depthFragmentShader = useMemo(() => {
        let fs = THREE.ShaderLib.depth.fragmentShader;
        fs = `
            varying vec2 vMyUv;
            uniform vec2 uSize;
            float boxSDF(vec2 p, vec2 b, float r) {
                vec2 q = abs(p) - b + vec2(r);
                return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
            }
        ` + fs;
        fs = fs.replace(
            "void main() {",
            `
        void main() {
            vec2 p = (vMyUv - 0.5) * uSize;
            float cornerRadius = min(uSize.x, uSize.y) * 0.03;
            if (boxSDF(p, uSize * 0.5, cornerRadius) > 0.0) {
                discard;
            }
            `
        );
        return fs;
    }, []);

    return (
        <mesh receiveShadow castShadow>
            <planeGeometry args={[size.w, size.h, meshSegments, meshSegments]} />

            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                side={THREE.DoubleSide}
                transparent={true}
            />

            <shaderMaterial
                attach="customDepthMaterial"
                vertexShader={depthVertexShader}
                fragmentShader={depthFragmentShader}
                uniforms={depthUniforms}
                defines={{ DEPTH_PACKING: 3201 }}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

function Scene({
    peelDist,
    angle,
    meshSegments,
    opacity,
    maxDistRef,
    liveAngleRadRef,
    shadowMapSize,
}: {
    peelDist: number;
    angle: number;
    meshSegments: number;
    opacity: number;
    maxDistRef: React.MutableRefObject<number>;
    liveAngleRadRef: React.MutableRefObject<number>;
    shadowMapSize: number;
}) {
    const { viewport } = useThree();

    const pad = Math.min(viewport.width, viewport.height) * 0.08;
    const pageW = viewport.width - 2 * pad;
    const pageH = viewport.height - 2 * pad;
    const shadowPlaneZ = -0.12;
    const shadowFrustumX = pageW * 0.9;
    const shadowFrustumY = pageH * 0.9;

    // Calculate max drag distance for safety.
    useEffect(() => {
        maxDistRef.current = Math.sqrt(pageW * pageW + pageH * pageH) * 2.0;
    }, [pageW, pageH, maxDistRef]);

    return (
        <>
            <ambientLight intensity={0.5} color="#ffffff" />
            <directionalLight
                position={[6, 6, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[shadowMapSize, shadowMapSize]}
                shadow-bias={-0.0001}
                shadow-normalBias={0.02}
                shadow-radius={1.5}
                shadow-camera-left={-shadowFrustumX}
                shadow-camera-right={shadowFrustumX}
                shadow-camera-top={shadowFrustumY}
                shadow-camera-bottom={-shadowFrustumY}
                shadow-camera-near={0.1}
                shadow-camera-far={20}
            />

            <group>
                <PageComponent
                    peelDist={peelDist}
                    angle={angle}
                    meshSegments={meshSegments}
                    opacity={opacity}
                    size={{ w: pageW, h: pageH }}
                    liveAngleRadRef={liveAngleRadRef}
                />

                <mesh position={[0, 0, shadowPlaneZ]} receiveShadow>
                    <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
                    <shadowMaterial opacity={0.3} transparent depthWrite={false} />
                </mesh>
            </group>
        </>
    );
}

interface PageCurlEmbed3DProps {
    demo?: boolean;
    hideControls?: boolean;
    initialAngle?: number;
    initialOpacity?: number;
    initialPeelDist?: number;
    interactive?: boolean;
    performancePreset?: PageCurlPerformancePreset;
}

export default function PageCurlEmbed3D({
    demo = false,
    hideControls = demo,
    initialAngle = demo ? 45 : 225,
    initialOpacity = demo ? 0.5 : 1,
    initialPeelDist = demo ? 1.5 : 0,
    interactive = !demo,
    performancePreset = "default",
}: PageCurlEmbed3DProps) {
    const performance = resolvePageCurlPerformanceSettings(performancePreset);
    const canvasDprProps =
        performance.canvasDpr === undefined ? {} : { dpr: performance.canvasDpr };
    const [angle, setAngle] = useState(initialAngle);
    const [opacity, setOpacity] = useState(initialOpacity);
    const [peelDist, setPeelDist] = useState(initialPeelDist);

    const dragging = useRef(false);
    const downClient = useRef({ x: 0, y: 0 });
    const peelAtDown = useRef(0);
    const maxDistRef = useRef(10);
    const liveAngleRadRef = useRef(initialAngle * (Math.PI / 180));

    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!interactive) return;
        dragging.current = true;
        downClient.current = { x: e.clientX, y: e.clientY };
        peelAtDown.current = peelDist;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!interactive || !dragging.current) return;

        const rect = canvasContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Use the same animated angle the shader currently uses.
        const rad = liveAngleRadRef.current;
        // Convert inward vector from world Y-up to pointer/canvas Y-down space.
        const inwardX = -Math.cos(rad);
        const inwardY = -Math.sin(rad);

        // Movement in pixels
        const dragDx = e.clientX - downClient.current.x;
        const dragDy = e.clientY - downClient.current.y;

        // In 2D space, inward proj is calculated in pixels.
        // Here we need a screen-to-world ratio. We can approximate using rect.width and maxDist.
        // A generic scale factor so it feels 1:1 with pointer:
        const screenToWorld =
            maxDistRef.current /
            Math.sqrt(rect.width * rect.width + rect.height * rect.height);

        const proj = (dragDx * inwardX + dragDy * inwardY) * screenToWorld;

        const bounded = Math.max(
            0,
            Math.min(maxDistRef.current, peelAtDown.current + proj * 1.5),
        );
        setPeelDist(bounded);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!interactive) return;
        dragging.current = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        // Do not reset peelDist! Same behavior as 2D canvas.
    };

    return (
        <div
            className={styles.embedWrapper}
            style={{
                height: "100%",
                width: "100%",
            }}
        >
            <div
                ref={canvasContainerRef}
                className={styles.curlCanvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onLostPointerCapture={() => {
                    dragging.current = false;
                }}
                style={{
                    background: "transparent",
                    touchAction: "none",
                    cursor: interactive ? "grab" : "default",
                }}
            >
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    shadows={true}
                    {...canvasDprProps}
                >
                    <Scene
                        peelDist={peelDist}
                        angle={angle}
                        meshSegments={performance.meshSegments}
                        opacity={opacity}
                        maxDistRef={maxDistRef}
                        liveAngleRadRef={liveAngleRadRef}
                        shadowMapSize={performance.shadowMapSize}
                    />
                </Canvas>
            </div>

            {!hideControls && (
                <div
                    className={styles.embedControls}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerMove={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                >
                    <div className={styles.controlItem}>
                        <span className={styles.controlLabel}>Opacity</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className={styles.slider}
                            aria-label="Backside opacity"
                        />
                    </div>
                    <div className={styles.controlItem}>
                        <span className={styles.controlLabel}>Angle</span>
                        <input
                            type="range"
                            min="0"
                            max="315"
                            step="1"
                            value={angle}
                            onChange={(e) => setAngle(parseInt(e.target.value))}
                            className={styles.slider}
                            aria-label="Curl angle"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
