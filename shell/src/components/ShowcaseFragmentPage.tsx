const SHOWCASE_FRAGMENT_ID = "showcase-lab";
const SHOWCASE_FRAGMENT_SRC = "/showcase/";

export function ShowcaseFragmentPage() {
  return (
    <>
      <section style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Showcase Fragment</h1>
        <p style={{ maxWidth: "48rem", color: "var(--color-text-secondary)" }}>
          This page renders the fragment at the top-level route so you can
          explore it full width.
        </p>
      </section>

      <web-fragment
        fragment-id={SHOWCASE_FRAGMENT_ID}
        src={SHOWCASE_FRAGMENT_SRC}
      ></web-fragment>
    </>
  );
}
