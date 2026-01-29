import type { DensityStyles } from "../types";

interface ShellHeaderProps {
  densityStyles: DensityStyles;
  motionTransition: string;
}

export function ShellHeader({
  densityStyles,
  motionTransition,
}: ShellHeaderProps) {
  return (
    <section
      style={{
        marginBottom: densityStyles.sectionMargin,
        transition: motionTransition,
      }}
    >
      <h1
        style={{
          marginBottom: "0.5rem",
          fontSize: densityStyles.h1FontSize,
          transition: motionTransition,
        }}
      >
        Shell Host
      </h1>
      <p
        style={{
          maxWidth: "48rem",
          color: "var(--color-text-secondary)",
          fontSize: densityStyles.fontSize,
          transition: motionTransition,
        }}
      >
        This host renders Web Fragments. Use the navigation above to open
        Projects and view assignments.
      </p>
    </section>
  );
}
