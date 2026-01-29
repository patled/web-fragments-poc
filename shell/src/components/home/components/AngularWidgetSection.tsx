import { useFragmentHealthCheck } from "../../../hooks/useFragmentHealthCheck";
import {
  ANGULAR_WIDGET_FRAGMENT_ID,
  ANGULAR_WIDGET_FRAGMENT_SRC,
} from "../constants";
import type { DensityStyles } from "../types";
import { FragmentUnavailableOverlay } from "./FragmentUnavailableOverlay";

interface AngularWidgetMessage {
  type?: string;
  timestamp?: string;
  payload?: { clickCount?: number };
}

interface AngularWidgetSectionProps {
  message: AngularWidgetMessage | null;
  densityStyles: DensityStyles;
  motionTransition: string;
}

export function AngularWidgetSection({
  message,
  densityStyles,
  motionTransition,
}: AngularWidgetSectionProps) {
  const angularWidgetAvailable = useFragmentHealthCheck(
    ANGULAR_WIDGET_FRAGMENT_SRC,
    ANGULAR_WIDGET_FRAGMENT_ID,
    { onError: () => console.warn("Angular widget fragment not available") },
  );

  return (
    <section
      style={{
        marginTop: densityStyles.sectionMargin,
        transition: motionTransition,
      }}
    >
      <div style={{ marginBottom: densityStyles.gap }}>
        <h2
          style={{
            margin: 0,
            fontSize: densityStyles.h2FontSize,
            transition: motionTransition,
          }}
        >
          Angular Widget (live)
        </h2>
        <p
          style={{
            margin: "0.35rem 0 0",
            color: "var(--color-text-secondary)",
            fontSize: densityStyles.fontSize,
            transition: motionTransition,
          }}
        >
          A small Angular fragment embedded on the shell root.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: densityStyles.gap,
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: "0.75rem",
            overflow: "hidden",
            minHeight: 240,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-surface)",
          }}
        >
          {angularWidgetAvailable === false && (
            <FragmentUnavailableOverlay>
              <span>⚠️ Angular Widget not available</span>
            </FragmentUnavailableOverlay>
          )}
          <web-fragment
            style={{ display: "block", width: "100%", minHeight: 240 }}
            fragment-id={ANGULAR_WIDGET_FRAGMENT_ID}
            src={ANGULAR_WIDGET_FRAGMENT_SRC}
          />
        </div>

        {message && (
          <div
            style={{
              padding: densityStyles.statusPadding,
              borderRadius: "0.6rem",
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "var(--color-bg-surface)",
              fontSize: densityStyles.statusFontSize,
            }}
          >
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: densityStyles.h2FontSize,
              }}
            >
              Angular Widget Status
            </h3>
            <p
              style={{
                margin: "0.25rem 0",
                color: "var(--color-text-secondary)",
              }}
            >
              <strong>Event:</strong> {message.type}
            </p>
            {message.payload?.clickCount !== undefined && (
              <p
                style={{
                  margin: "0.25rem 0",
                  color: "var(--color-text-secondary)",
                }}
              >
                <strong>Click Count:</strong> {message.payload.clickCount}
              </p>
            )}
            {message.timestamp && (
              <p
                style={{
                  margin: "0.25rem 0",
                  color: "var(--color-text-secondary)",
                }}
              >
                <strong>Time:</strong>{" "}
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
