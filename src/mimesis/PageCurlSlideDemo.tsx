import PageCurlEmbed3D from "@mimesis/projects/page-curl/PageCurlEmbed3D";
import MimesisDemoFrame from "./MimesisDemoFrame";

export default function PageCurlSlideDemo() {
  return (
    <MimesisDemoFrame>
      <div data-project-id="ios-curl-animation">
        <PageCurlEmbed3D
          initialAngle={45}
          initialOpacity={0.5}
          initialPeelDist={1.5}
          performancePreset="slides"
        />
      </div>
    </MimesisDemoFrame>
  );
}
