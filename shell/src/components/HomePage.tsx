import { useEffect, useRef, useState } from "react";
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
  const [fragmentAvailable, setFragmentAvailable] = useState<boolean | null>(
    null,
  );
  const fragmentElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(SHOWCASE_CHANNEL);
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;
      setLastMessage(event.data as ShowcaseMessage);
      // If we receive a message, the fragment is available
      setFragmentAvailable(true);
    };
    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  // Callback ref to set element when it's mounted
  const setFragmentRef = (element: HTMLElement | null) => {
    fragmentElementRef.current = element;
  };

  useEffect(() => {
    let cancelled = false;

    const healthCheck = async () => {
      try {
        // Trigger gateway forwarding (this is NOT a browser navigation)
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

    // Run immediately (and rely on fragment events afterwards)
    healthCheck();

    return () => {
      cancelled = true;
    };
  }, []);

  let statusContent: JSX.Element | string | null =
    "Waiting for the fragment to send its first event...";
  // Avoid duplicate messaging: when fragment is unavailable, only show the large fallback block below.
  if (fragmentAvailable === false) {
    statusContent = null;
  }
  if (lastMessage) {
    statusContent = (
      <>
        <strong style={{ color: "var(--color-text)" }}>Last event:</strong>{" "}
        {lastMessage.type}
        {lastMessage.payload?.accent ? ` • ${lastMessage.payload.accent}` : ""}
        {lastMessage.payload?.density
          ? ` • ${lastMessage.payload.density}`
          : ""}
        {lastMessage.payload?.motion ? ` • ${lastMessage.payload.motion}` : ""}
        {typeof lastMessage.payload?.counter === "number"
          ? ` • counter ${lastMessage.payload.counter}`
          : ""}
        {lastMessage.timestamp
          ? ` • ${new Date(lastMessage.timestamp).toLocaleTimeString()}`
          : ""}
      </>
    );
  }

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
            <p
              style={{
                margin: "0.35rem 0 0",
                color: "var(--color-text-secondary)",
              }}
            >
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
        {statusContent ? (
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
            {statusContent}
          </div>
        ) : null}
      </section>

      <div style={{ position: "relative" }}>
        {fragmentAvailable === false && (
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
            <span>⚠️ Showcase Fragment not available</span>
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
