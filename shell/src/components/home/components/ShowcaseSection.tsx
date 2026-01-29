import { useRef } from "react";
import { Link } from "react-router-dom";
import { useFragmentHealthCheck } from "../../../hooks/useFragmentHealthCheck";
import {
  SHOWCASE_FRAGMENT_ID,
  SHOWCASE_FRAGMENT_SRC,
  ACCENT_COLOR_MAP,
} from "../constants";
import type { DensityStyles } from "../types";
import type { ShowcaseMessage, ShowcaseSettings } from "../types";
import { FragmentUnavailableOverlay } from "./FragmentUnavailableOverlay";
import { ShowcaseStatusContent } from "./ShowcaseStatusContent";

interface ShowcaseSectionProps {
  lastMessage: ShowcaseMessage | null;
  settings: ShowcaseSettings | null;
  densityStyles: DensityStyles;
  motionTransition: string;
}

export function ShowcaseSection({
  lastMessage,
  settings,
  densityStyles,
  motionTransition,
}: ShowcaseSectionProps) {
  const fragmentElementRef = useRef<HTMLElement | null>(null);

  const fragmentAvailable = useFragmentHealthCheck(
    SHOWCASE_FRAGMENT_SRC,
    SHOWCASE_FRAGMENT_ID,
    { onError: () => console.warn("Showcase fragment not available") },
  );

  const accentColor =
    settings?.accent && ACCENT_COLOR_MAP[settings.accent]
      ? ACCENT_COLOR_MAP[settings.accent]
      : ACCENT_COLOR_MAP["Electric Blue"];

  const hasStatus = lastMessage || settings;
  const statusContent =
    fragmentAvailable === false ? null : hasStatus ? (
      <ShowcaseStatusContent lastMessage={lastMessage} settings={settings} />
    ) : (
      "Waiting for the fragment to send its first event..."
    );

  return (
    <section
      style={{
        marginBottom: densityStyles.sectionMargin,
        transition: motionTransition,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: densityStyles.gap,
          transition: motionTransition,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: densityStyles.h2FontSize,
              transition: motionTransition,
            }}
          >
            Showcase Fragment (live)
          </h2>
          <p
            style={{
              margin: "0.35rem 0 0",
              color: "var(--color-text-secondary)",
              fontSize: densityStyles.fontSize,
              transition: motionTransition,
            }}
          >
            Interact with the fragment below. It sends events back to this shell
            in real time.
          </p>
        </div>
        <Link
          to="/showcase"
          style={{
            marginLeft: "auto",
            padding: densityStyles.statusPadding,
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border-strong)",
            textDecoration: "none",
            color: "var(--color-text)",
            background: "var(--color-bg-surface)",
            fontSize: densityStyles.fontSize,
            transition: motionTransition,
          }}
        >
          Open full page →
        </Link>
      </div>
      {statusContent && (
        <div
          style={{
            marginTop: densityStyles.gap,
            padding: densityStyles.statusPadding,
            borderRadius: "0.6rem",
            border: `2px solid ${accentColor}`,
            color: "var(--color-text-secondary)",
            background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
            fontSize: densityStyles.statusFontSize,
            transition: motionTransition,
          }}
        >
          {statusContent}
        </div>
      )}
      <div
        style={{
          position: "relative",
          borderRadius: "0.75rem",
          padding: settings ? densityStyles.padding : "0",
          background: settings
            ? `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`
            : "transparent",
          border: settings ? `1px solid ${accentColor}30` : "none",
          transition: motionTransition,
        }}
      >
        {fragmentAvailable === false && (
          <FragmentUnavailableOverlay>
            <span>⚠️ Showcase Fragment not available</span>
          </FragmentUnavailableOverlay>
        )}
        {fragmentAvailable !== false && (
          <web-fragment
            ref={(el: HTMLElement | null) => {
              fragmentElementRef.current = el;
            }}
            fragment-id={SHOWCASE_FRAGMENT_ID}
            src={SHOWCASE_FRAGMENT_SRC}
          />
        )}
      </div>
    </section>
  );
}
