import WiperTypographyDriverView3D from "@mimesis/projects/wiper-typography/WiperTypographyDriverView3D";
import MimesisDemoFrame from "./MimesisDemoFrame";

export default function WiperTypographySlideDemo() {
  return (
    <MimesisDemoFrame>
      <WiperTypographyDriverView3D
        performancePreset="slides"
        projectId="wiper-typography"
      />
    </MimesisDemoFrame>
  );
}
