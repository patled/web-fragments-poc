import { useEffect, useRef, useState } from "react";

const SHOWCASE_FRAGMENT_ID = "showcase-lab";
const SHOWCASE_FRAGMENT_SRC = "/showcase/";
const SHOWCASE_CHANNEL = "showcase-fragment-channel";
const STORAGE_KEY = "showcase-fragment-settings";

// Accent color mapping (matching showcase-fragment/src/ShowcaseFragment.tsx)
const accentColorMap: Record<string, string> = {
  "Electric Blue": "#4f7cff",
  "Neon Mint": "#18d6a3",
  "Sunset Amber": "#ff9a3c",
  "Orchid Glow": "#b86bff",
};

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
  const [fragmentAvailable, setFragmentAvailable] = useState<boolean | null>(
    null,
  );
  const fragmentElementRef = useRef<HTMLElement | null>(null);

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
          console.warn("Failed to save showcase settings to localStorage", error);
        }
      }
      
      // If we receive a message, the fragment is available
      setFragmentAvailable(true);
    };
    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const healthCheck = async () => {
      try {
        const response = await fetch(SHOWCASE_FRAGMENT_SRC, {
          headers: {
            accept: "text/html",
            "x-web-fragment-id": SHOWCASE_FRAGMENT_ID,
          },
        });

        if (cancelled) return;
        setFragmentAvailable(response.ok);
      } catch {
        if (cancelled) return;
        setFragmentAvailable(false);
      }
    };

    healthCheck();

    return () => {
      cancelled = true;
    };
  }, []);

  // Get accent color for visual effects
  const accentColor =
    settings?.accent && accentColorMap[settings.accent]
      ? accentColorMap[settings.accent]
      : accentColorMap["Electric Blue"];

  return (
    <>
      <section style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Showcase Fragment</h1>
        <p style={{ maxWidth: "48rem", color: "var(--color-text-secondary)" }}>
          This page renders the fragment at the top-level route so you can
          explore it full width.
        </p>
        {settings && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.6rem 0.85rem",
              borderRadius: "0.6rem",
              border: `2px solid ${accentColor}`,
              color: "var(--color-text-secondary)",
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
              transition: "all 0.3s ease",
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
          padding: settings ? "0.5rem" : "0",
          background: settings
            ? `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`
            : "transparent",
          border: settings ? `1px solid ${accentColor}30` : "none",
          transition: "all 0.3s ease",
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
