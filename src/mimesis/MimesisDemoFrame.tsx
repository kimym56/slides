import type { ReactNode } from "react";

export default function MimesisDemoFrame({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="project-demo-frame"
      data-demo-interaction-zone
      data-testid="mimesis-demo-frame"
    >
      {children}
    </div>
  );
}
