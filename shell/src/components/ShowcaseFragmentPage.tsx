import { useEffect, useMemo, useRef, useState } from "react";
import {
  ACCENT_COLOR_MAP,
  SHOWCASE_CHANNEL,
  SHOWCASE_FRAGMENT_ID,
  SHOWCASE_FRAGMENT_SRC,
  STORAGE_KEY,
} from "./home/constants";
import { useFragmentHealthCheck } from "../hooks/useFragmentHealthCheck";

// Helper functions for density and motion styling
function getDensityStyles(densityId?: string) {
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

function getMotionTransition(motionId?: string) {
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

interface ShowcaseMessage {
  type: string;
  timestamp?: string;
  payload?: {
    accent?: string;
    density?: string;
    motion?: string;
    counter?: number;
  };
}

interface ShowcaseSettings {
  accent?: string;
  density?: string;
  motion?: string;
  counter?: number;
}

export function ShowcaseFragmentPage() {
  const [settings, setSettings] = useState<ShowcaseSettings | null>(null);
  const fragmentElementRef = useRef<HTMLElement | null>(null);

  const fragmentAvailable = useFragmentHealthCheck(
    SHOWCASE_FRAGMENT_SRC,
    SHOWCASE_FRAGMENT_ID,
  );

  // Callback ref to set element when it's mounted
  const setFragmentRef = (element: HTMLElement | null) => {
    fragmentElementRef.current = element;
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ShowcaseSettings;
        setSettings(parsed);
      }
    } catch (error) {
      console.warn("Failed to load showcase settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel(SHOWCASE_CHANNEL);
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;
      const message = event.data as ShowcaseMessage;

      // Store settings when we receive showcase-settings messages
      if (message.type === "showcase-settings" && message.payload) {
        const newSettings: ShowcaseSettings = {
          accent: message.payload.accent,
          density: message.payload.density,
          motion: message.payload.motion,
          counter: message.payload.counter,
        };
        setSettings(newSettings);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
          console.warn(
            "Failed to save showcase settings to localStorage",
            error,
          );
        }
      }
    };
    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  // Get accent color for visual effects
  const accentColor =
    settings?.accent && ACCENT_COLOR_MAP[settings.accent]
      ? ACCENT_COLOR_MAP[settings.accent]
      : ACCENT_COLOR_MAP["Electric Blue"];

  // Get density and motion styles
  const densityStyles = useMemo(
    () => getDensityStyles(settings?.density),
    [settings?.density],
  );
  const motionTransition = useMemo(
    () => getMotionTransition(settings?.motion),
    [settings?.motion],
  );

  return (
    <>
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
          Showcase Fragment
        </h1>
        <p
          style={{
            maxWidth: "48rem",
            color: "var(--color-text-secondary)",
            fontSize: densityStyles.fontSize,
            transition: motionTransition,
          }}
        >
          This page renders the fragment at the top-level route so you can
          explore it full width.
        </p>
        {settings && (
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
              display: "inline-block",
            }}
          >
            <strong style={{ color: "var(--color-text)" }}>
              Active settings:
            </strong>{" "}
            {settings.accent && `Accent: ${settings.accent}`}
            {settings.density && ` • Density: ${settings.density}`}
            {settings.motion && ` • Motion: ${settings.motion}`}
            {typeof settings.counter === "number" &&
              ` • Counter: ${settings.counter}`}
          </div>
        )}
      </section>

      <div
        style={{
          position: "relative",
          minHeight: "400px",
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
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              padding: "3rem 2rem",
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
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "3rem" }}>⚠️</span>
            </div>
            <h2 style={{ margin: "0 0 0.75rem 0", color: "var(--color-text)" }}>
              Showcase Fragment not available
            </h2>
            <p
              style={{
                margin: "0 0 1rem 0",
                color: "var(--color-text-secondary)",
              }}
            >
              The Showcase Fragment Server is not running. Start it with:
            </p>
            <code
              style={{
                display: "inline-block",
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
                backgroundColor: "var(--color-bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontFamily: "monospace",
                fontSize: "0.9rem",
              }}
            >
              cd showcase-fragment && yarn dev
            </code>
            <p
              style={{
                margin: "1.5rem 0 0 0",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              The Server should be running on{" "}
              <strong>http://localhost:5176</strong>.
            </p>
          </div>
        )}
        {fragmentAvailable !== false && (
          <web-fragment
            ref={setFragmentRef}
            fragment-id={SHOWCASE_FRAGMENT_ID}
            src={SHOWCASE_FRAGMENT_SRC}
          ></web-fragment>
        )}
      </div>
    </>
  );
}
