import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SHOWCASE_FRAGMENT_ID = "showcase-lab";
const SHOWCASE_FRAGMENT_SRC = "/showcase/";
const SHOWCASE_CHANNEL = "showcase-fragment-channel";

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

export function HomePage() {
  const [lastMessage, setLastMessage] = useState<ShowcaseMessage | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(SHOWCASE_CHANNEL);
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;
      setLastMessage(event.data as ShowcaseMessage);
    };
    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  return (
    <>
      <section style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Shell Host</h1>
        <p style={{ maxWidth: "48rem", color: "var(--color-text-secondary)" }}>
          This host renders Web Fragments. Use the navigation above to open
          Projects and view assignments.
        </p>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div>
            <h2 style={{ margin: 0 }}>Showcase Fragment (live)</h2>
            <p style={{ margin: "0.35rem 0 0", color: "var(--color-text-secondary)" }}>
              Interact with the fragment below. It sends events back to this
              shell in real time.
            </p>
          </div>
          <Link
            to="/showcase"
            style={{
              marginLeft: "auto",
              padding: "0.45rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border-strong)",
              textDecoration: "none",
              color: "var(--color-text)",
              background: "var(--color-bg-surface)",
            }}
          >
            Open full page →
          </Link>
        </div>
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.6rem 0.85rem",
            borderRadius: "0.6rem",
            border: "1px dashed var(--color-border)",
            color: "var(--color-text-secondary)",
            background: "var(--color-bg-surface)",
          }}
        >
          {lastMessage ? (
            <>
              <strong style={{ color: "var(--color-text)" }}>Last event:</strong>{" "}
              {lastMessage.type}
              {lastMessage.payload?.accent
                ? ` • ${lastMessage.payload.accent}`
                : ""}
              {lastMessage.payload?.density
                ? ` • ${lastMessage.payload.density}`
                : ""}
              {lastMessage.payload?.motion
                ? ` • ${lastMessage.payload.motion}`
                : ""}
              {typeof lastMessage.payload?.counter === "number"
                ? ` • counter ${lastMessage.payload.counter}`
                : ""}
              {lastMessage.timestamp
                ? ` • ${new Date(lastMessage.timestamp).toLocaleTimeString()}`
                : ""}
            </>
          ) : (
            "Waiting for the fragment to send its first event..."
          )}
        </div>
      </section>

      <web-fragment
        fragment-id={SHOWCASE_FRAGMENT_ID}
        src={SHOWCASE_FRAGMENT_SRC}
      ></web-fragment>
    </>
  );
}
