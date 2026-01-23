export function HomePage() {
  return (
    <>
      <section style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Shell Host</h1>
        <p style={{ maxWidth: "48rem", color: "#4b5563" }}>
          This host renders Web Fragments provided by the fragments app. Navigate
          to the fragment routes to see them mounted.
        </p>
      </section>
      <p style={{ color: "#6b7280" }}>
        Use the navigation above to switch between fragments.
      </p>
    </>
  );
}
