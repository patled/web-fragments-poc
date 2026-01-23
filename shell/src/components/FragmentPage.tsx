import { FragmentCommunication } from "./FragmentCommunication";

interface FragmentPageProps {
  fragmentId: string;
  basePath: string;
}

export function FragmentPage({ fragmentId, basePath }: FragmentPageProps) {
  return (
    <>
      <section style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Shell Host</h1>
        <p style={{ maxWidth: "48rem", color: "#4b5563" }}>
          This host renders Web Fragments provided by the remote app. Navigate
          to the fragment routes to see them mounted.
        </p>
      </section>

      <FragmentCommunication fragmentId={fragmentId} isActive={true} />

      <web-fragment key={fragmentId} fragment-id={fragmentId}></web-fragment>
    </>
  );
}
