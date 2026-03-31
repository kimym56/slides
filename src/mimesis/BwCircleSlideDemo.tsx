import BwCircleProject from "@mimesis/projects/bw-circle/BwCircleProject";
import MimesisDemoFrame from "./MimesisDemoFrame";

export default function BwCircleSlideDemo() {
  return (
    <MimesisDemoFrame>
      <BwCircleProject
        hideControls
        initialMode="sync"
        projectId="black-white-circle"
      />
    </MimesisDemoFrame>
  );
}
