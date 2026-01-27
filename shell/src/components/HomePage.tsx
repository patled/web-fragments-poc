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
  const fragmentRef = useRef<HTMLElement | null>(null);
  const checkTimeoutRef = useRef<number | null>(null);
  const fragmentElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(SHOWCASE_CHANNEL);
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;
      setLastMessage(event.data as ShowcaseMessage);
      // If we receive a message, the fragment is available
      setFragmentAvailable((prev) => {
        if (prev === null || prev === false) {
          return true;
        }
        return prev;
      });
    };
    channel.addEventListener("message", handleMessage);

    // Check if fragment becomes available after a delay
    checkTimeoutRef.current = window.setTimeout(() => {
      setFragmentAvailable((prev) => {
        // If no message received after 2 seconds, assume fragment is not available
        if (prev === null) {
          return false;
        }
        return prev;
      });
    }, 2000);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  // Callback ref to set element when it's mounted
  const setFragmentRef = (element: HTMLElement | null) => {
    fragmentElementRef.current = element;
    fragmentRef.current = element;
  };

  useEffect(() => {
    let intervalId: number | null = null;
    let observer: MutationObserver | null = null;
    const iframeHandlers = new Map<
      HTMLIFrameElement,
      { load: () => void; error: () => void }
    >();

    const checkFragmentLoaded = () => {
      try {
        const fragmentElement = fragmentElementRef.current;
        if (!fragmentElement) return false;

        // Check if fragment has shadow root (indicates it loaded)
        if (fragmentElement.shadowRoot) {
          setFragmentAvailable(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error("[HomePage] Error checking fragment:", error);
        return false;
      }
    };

    const handleError = () => {
      setFragmentAvailable(false);
    };

    const handleLoad = () => {
      setFragmentAvailable(true);
    };

    const setupListeners = () => {
      try {
        const fragmentElement = fragmentElementRef.current;
        if (!fragmentElement) return false;

        // Check immediately
        checkFragmentLoaded();

        // Check periodically
        if (intervalId) clearInterval(intervalId);
        intervalId = window.setInterval(() => {
          checkFragmentLoaded();
        }, 500);

        fragmentElement.addEventListener("error", handleError);
        fragmentElement.addEventListener("load", handleLoad);

        // Use MutationObserver to catch dynamically added iframes
        observer = new MutationObserver(() => {
          try {
            const iframes = fragmentElement.querySelectorAll("iframe");
            iframes.forEach((newIframe) => {
              if (!iframeHandlers.has(newIframe)) {
                const handlers = {
                  load: handleLoad,
                  error: handleError,
                };
                newIframe.addEventListener("load", handlers.load);
                newIframe.addEventListener("error", handlers.error);
                iframeHandlers.set(newIframe, handlers);
              }
            });
          } catch (error) {
            console.error("[HomePage] Error in MutationObserver:", error);
          }
        });

        observer.observe(fragmentElement, { childList: true, subtree: true });

        // Check for existing iframes
        const existingIframes = fragmentElement.querySelectorAll("iframe");
        existingIframes.forEach((existingIframe) => {
          if (!iframeHandlers.has(existingIframe)) {
            const handlers = {
              load: handleLoad,
              error: handleError,
            };
            existingIframe.addEventListener("load", handlers.load);
            existingIframe.addEventListener("error", handlers.error);
            iframeHandlers.set(existingIframe, handlers);
          }
        });

        return true;
      } catch (error) {
        console.error("[HomePage] Error setting up fragment listeners:", error);
        return false;
      }
    };

    // Try to setup listeners immediately
    if (!setupListeners()) {
      // Retry after a short delay if element is not yet available
      const retryTimeout = setTimeout(() => {
        setupListeners();
      }, 100);
      return () => {
        clearTimeout(retryTimeout);
        if (intervalId) clearInterval(intervalId);
        if (observer) observer.disconnect();
        const fragmentElement = fragmentElementRef.current;
        if (fragmentElement) {
          fragmentElement.removeEventListener("error", handleError);
          fragmentElement.removeEventListener("load", handleLoad);
        }
        iframeHandlers.forEach((handlers, iframe) => {
          iframe.removeEventListener("load", handlers.load);
          iframe.removeEventListener("error", handlers.error);
        });
        iframeHandlers.clear();
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (observer) observer.disconnect();
      const fragmentElement = fragmentElementRef.current;
      if (fragmentElement) {
        fragmentElement.removeEventListener("error", handleError);
        fragmentElement.removeEventListener("load", handleLoad);
      }
      iframeHandlers.forEach((handlers, iframe) => {
        iframe.removeEventListener("load", handlers.load);
        iframe.removeEventListener("error", handlers.error);
      });
      iframeHandlers.clear();
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
              <strong style={{ color: "var(--color-text)" }}>
                Last event:
              </strong>{" "}
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
          ) : fragmentAvailable === false ? (
            "Fragment not available. Start the showcase-fragment server to enable this feature."
          ) : (
            "Waiting for the fragment to send its first event..."
          )}
        </div>
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
            <div style={{ marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "2rem" }}>⚠️</span>
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text)" }}>
              Showcase Fragment not available
            </h3>
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
              The Showcase Fragment Server is not running. Start it with:
            </p>
            <code
              style={{
                display: "inline-block",
                marginTop: "0.75rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                backgroundColor: "var(--color-bg-page)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontFamily: "monospace",
              }}
            >
              cd showcase-fragment && yarn dev
            </code>
          </div>
        )}
        <web-fragment
          ref={setFragmentRef}
          fragment-id={SHOWCASE_FRAGMENT_ID}
          src={SHOWCASE_FRAGMENT_SRC}
        ></web-fragment>
      </div>
    </>
  );
}
