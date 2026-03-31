import StaggeredTextProject from "@mimesis/projects/staggered-text/StaggeredTextProject";
import MimesisDemoFrame from "./MimesisDemoFrame";

export default function StaggeredTextSlideDemo() {
  return (
    <MimesisDemoFrame>
      <StaggeredTextProject
        hideControls
        initialMode="button"
        projectId="staggered-text"
      />
    </MimesisDemoFrame>
  );
}
