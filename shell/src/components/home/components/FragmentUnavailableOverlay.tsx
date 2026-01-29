import type { ReactNode } from "react";

interface FragmentUnavailableOverlayProps {
  children: ReactNode;
}

export function FragmentUnavailableOverlay({
  children,
}: FragmentUnavailableOverlayProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        padding: "2rem",
        borderRadius: "0.75rem",
        border: "1px dashed var(--color-border)",
        backgroundColor: "var(--color-bg-surface)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}
