import { useEffect, useMemo, useRef, useState } from "react";
import { useMsal } from "@azure/msal-react";

const FRAGMENT_ID = "showcase-lab";
const CHANNEL_NAME = "showcase-fragment-channel";
const STORAGE_KEY = "showcase-fragment-settings";

interface StoredSettings {
  accent?: string;
  density?: string;
  motion?: string;
  counter?: number;
}

const accentOptions = [
  { id: "electric", label: "Electric Blue", color: "#4f7cff" },
  { id: "mint", label: "Neon Mint", color: "#18d6a3" },
  { id: "sunset", label: "Sunset Amber", color: "#ff9a3c" },
  { id: "orchid", label: "Orchid Glow", color: "#b86bff" },
];

const densityOptions = [
  { id: "cozy", label: "Cozy" },
  { id: "balanced", label: "Balanced" },
  { id: "compact", label: "Compact" },
];

const motionOptions = [
  { id: "ambient", label: "Ambient" },
  { id: "snappy", label: "Snappy" },
  { id: "still", label: "Still" },
];

// Helper function to load settings from localStorage
function loadSettingsFromStorage(): {
  accentId: string;
  densityId: string;
  motionId: string;
  counter: number;
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredSettings;

      // Map accent label back to id
      let accentId = accentOptions[0].id;
      if (parsed.accent) {
        const accentOption = accentOptions.find(
          (opt) => opt.label === parsed.accent,
        );
        if (accentOption) {
          accentId = accentOption.id;
        }
      }

      // Map density label back to id
      let densityId = densityOptions[1].id;
      if (parsed.density) {
        const densityOption = densityOptions.find(
          (opt) => opt.id === parsed.density || opt.label === parsed.density,
        );
        if (densityOption) {
          densityId = densityOption.id;
        }
      }

      // Map motion label back to id
      let motionId = motionOptions[0].id;
      if (parsed.motion) {
        const motionOption = motionOptions.find(
          (opt) => opt.id === parsed.motion || opt.label === parsed.motion,
        );
        if (motionOption) {
          motionId = motionOption.id;
        }
      }

      const counter =
        typeof parsed.counter === "number" && parsed.counter >= 0
          ? parsed.counter
          : 6;

      return { accentId, densityId, motionId, counter };
    }
  } catch (error) {
    console.warn("Failed to load settings from localStorage", error);
  }

  // Return defaults
  return {
    accentId: accentOptions[0].id,
    densityId: densityOptions[1].id,
    motionId: motionOptions[0].id,
    counter: 6,
  };
}

export function ShowcaseFragment() {
  const { instance } = useMsal();
  const loadedSettings = loadSettingsFromStorage();
  const [accentId, setAccentId] = useState(loadedSettings.accentId);
  const [densityId, setDensityId] = useState(loadedSettings.densityId);
  const [motionId, setMotionId] = useState(loadedSettings.motionId);
  const [counter, setCounter] = useState(loadedSettings.counter);
  const [isStandalone] = useState(() => {
    try {
      return window.self === window.top;
    } catch {
      return true;
    }
  });
  const channelRef = useRef<BroadcastChannel | null>(null);

  const accent = useMemo(
    () =>
      accentOptions.find((option) => option.id === accentId) ??
      accentOptions[0],
    [accentId],
  );

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.postMessage({
      type: "showcase-ready",
      fragmentId: FRAGMENT_ID,
      payload: { status: "ready" },
      timestamp: new Date().toISOString(),
    });

    // Send current settings immediately when channel is ready
    channel.postMessage({
      type: "showcase-settings",
      fragmentId: FRAGMENT_ID,
      payload: {
        accent: accent.label,
        density: densityId,
        motion: motionId,
        counter,
      },
      timestamp: new Date().toISOString(),
    });

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;
    channel.postMessage({
      type: "showcase-settings",
      fragmentId: FRAGMENT_ID,
      payload: {
        accent: accent.label,
        density: densityId,
        motion: motionId,
        counter,
      },
      timestamp: new Date().toISOString(),
    });
  }, [accent.label, counter, densityId, motionId]);

  return (
    <div
      style={{
        fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
        color: "#0f172a",
        padding: "1.75rem",
        borderRadius: "1.25rem",
        border: "1px solid rgba(15, 23, 42, 0.12)",
        background:
          "linear-gradient(135deg, rgba(240, 244, 255, 0.9), rgba(255, 255, 255, 0.98))",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
      }}
    >
      {isStandalone ? (
        <div
          style={{
            padding: "0.4rem 0.75rem",
            borderRadius: "999px",
            backgroundColor: "rgba(15, 23, 42, 0.08)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <span>🧪</span>
          <span>Standalone mode: fragment running solo.</span>
        </div>
      ) : null}

      <header style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 18rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>
            Web Fragment Showcase
          </h1>
          <p style={{ margin: "0.5rem 0 0", color: "#475569" }}>
            A playful lab to explore isolation, events, and UI customization
            from inside a fragment.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {isStandalone ? (
            <button
              type="button"
              onClick={() => instance.logoutRedirect()}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(15, 23, 42, 0.18)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Abmelden
            </button>
          ) : null}
        </div>
      </header>

      <section
        style={{
          marginTop: "1.75rem",
          padding: "1.25rem",
          borderRadius: "1rem",
          border: "1px dashed rgba(99, 102, 241, 0.4)",
          backgroundColor: "rgba(249, 250, 255, 0.9)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Live Controls</h2>
        <p
          style={{
            margin: "0.4rem 0 1rem",
            color: "#475569",
            fontSize: "0.9rem",
          }}
        >
          Tweak the fragment state and broadcast the changes to the shell.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <label
            style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}
          >
            Accent palette
            <select
              value={accentId}
              onChange={(event) => setAccentId(event.target.value)}
              style={{
                padding: "0.45rem 0.6rem",
                borderRadius: "0.6rem",
                border: `1px solid ${accent.color}`,
                backgroundColor: "white",
              }}
            >
              {accentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}
          >
            Density
            <select
              value={densityId}
              onChange={(event) => setDensityId(event.target.value)}
              style={{
                padding: "0.45rem 0.6rem",
                borderRadius: "0.6rem",
                border: "1px solid rgba(148, 163, 184, 0.6)",
                backgroundColor: "white",
              }}
            >
              {densityOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}
          >
            Motion
            <select
              value={motionId}
              onChange={(event) => setMotionId(event.target.value)}
              style={{
                padding: "0.45rem 0.6rem",
                borderRadius: "0.6rem",
                border: "1px solid rgba(148, 163, 184, 0.6)",
                backgroundColor: "white",
              }}
            >
              {motionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}>
            Counter
            <div
              style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}
            >
              <button
                type="button"
                onClick={() => setCounter((value) => Math.max(0, value - 1))}
                style={{
                  borderRadius: "0.55rem",
                  border: "1px solid rgba(148, 163, 184, 0.6)",
                  backgroundColor: "white",
                  padding: "0.35rem 0.6rem",
                  cursor: "pointer",
                }}
              >
                -
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                {counter}
              </span>
              <button
                type="button"
                onClick={() => setCounter((value) => value + 1)}
                style={{
                  borderRadius: "0.55rem",
                  border: "1px solid rgba(148, 163, 184, 0.6)",
                  backgroundColor: "white",
                  padding: "0.35rem 0.6rem",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "1.75rem" }}>
        <h2 style={{ marginBottom: "0.6rem", fontSize: "1.1rem" }}>
          Try these experiments
        </h2>
        <ol style={{ margin: 0, paddingLeft: "1.1rem", color: "#475569" }}>
          <li>
            Change any setting (accent palette, density, motion, or counter) and
            watch how changes are automatically broadcast to the shell.
          </li>
          <li>
            Check the HomePage in the shell to see the live event updates
            displayed in real time.
          </li>
        </ol>
      </section>
    </div>
  );
}
