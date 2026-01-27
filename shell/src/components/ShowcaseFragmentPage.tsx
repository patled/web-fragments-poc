import { useEffect, useRef, useState } from "react";

const SHOWCASE_FRAGMENT_ID = "showcase-lab";
const SHOWCASE_FRAGMENT_SRC = "/showcase/";

export function ShowcaseFragmentPage() {
  const [fragmentAvailable, setFragmentAvailable] = useState<boolean | null>(null);
  const fragmentElementRef = useRef<HTMLElement | null>(null);

  // Callback ref to set element when it's mounted
  const setFragmentRef = (element: HTMLElement | null) => {
    fragmentElementRef.current = element;
  };

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
