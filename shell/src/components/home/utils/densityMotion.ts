import type { DensityStyles } from "../types";

export function getDensityStyles(densityId?: string): DensityStyles {
  switch (densityId) {
    case "cozy":
      return {
        padding: "1.5rem",
        gap: "1.25rem",
        fontSize: "1rem",
        sectionMargin: "2rem",
        statusPadding: "0.85rem 1rem",
        statusFontSize: "0.95rem",
        h1FontSize: "1.75rem",
        h2FontSize: "1.3rem",
      };
    case "compact":
      return {
        padding: "0.75rem",
        gap: "0.75rem",
        fontSize: "0.875rem",
        sectionMargin: "1.25rem",
        statusPadding: "0.5rem 0.7rem",
        statusFontSize: "0.8rem",
        h1FontSize: "1.5rem",
        h2FontSize: "1rem",
      };
    case "balanced":
    default:
      return {
        padding: "1rem",
        gap: "1rem",
        fontSize: "0.9rem",
        sectionMargin: "1.5rem",
        statusPadding: "0.6rem 0.85rem",
        statusFontSize: "0.9rem",
        h1FontSize: "1.625rem",
        h2FontSize: "1.125rem",
      };
  }
}

export function getMotionTransition(motionId?: string): string {
  switch (motionId) {
    case "ambient":
      return "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
    case "snappy":
      return "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
    case "still":
    default:
      return "none";
  }
}
