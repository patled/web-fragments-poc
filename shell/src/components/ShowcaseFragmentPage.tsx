import { useEffect, useRef, useState } from "react";

const SHOWCASE_FRAGMENT_ID = "showcase-lab";
const SHOWCASE_FRAGMENT_SRC = "/showcase/";

export function ShowcaseFragmentPage() {
  const [fragmentAvailable, setFragmentAvailable] = useState<boolean | null>(null);
  const fragmentRef = useRef<HTMLElement | null>(null);
  const fragmentElementRef = useRef<HTMLElement | null>(null);
  const checkTimeoutRef = useRef<number | null>(null);

  // Callback ref to set element when it's mounted
  const setFragmentRef = (element: HTMLElement | null) => {
    fragmentElementRef.current = element;
    fragmentRef.current = element;
  };

  useEffect(() => {
    // Check if fragment becomes available after a delay
    checkTimeoutRef.current = window.setTimeout(() => {
      setFragmentAvailable((prev) => {
        // If fragment hasn't loaded after 2 seconds, assume it's not available
        if (prev === null) {
          return false;
        }
        return prev;
      });
    }, 2000);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let intervalId: number | null = null;
    let observer: MutationObserver | null = null;
    const iframeHandlers = new Map<HTMLIFrameElement, { load: () => void; error: () => void }>();

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
        console.error("[ShowcaseFragmentPage] Error checking fragment:", error);
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
            console.error("[ShowcaseFragmentPage] Error in MutationObserver:", error);
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
        console.error("[ShowcaseFragmentPage] Error setting up fragment listeners:", error);
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
      <section style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Showcase Fragment</h1>
        <p style={{ maxWidth: "48rem", color: "var(--color-text-secondary)" }}>
          This page renders the fragment at the top-level route so you can
          explore it full width.
        </p>
      </section>

      <div style={{ position: "relative", minHeight: "400px" }}>
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
              Showcase Fragment nicht verfügbar
            </h2>
            <p style={{ margin: "0 0 1rem 0", color: "var(--color-text-secondary)" }}>
              Der Showcase Fragment Server läuft nicht. Starte ihn mit:
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
              Der Server sollte auf <strong>http://localhost:5176</strong> laufen.
            </p>
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
