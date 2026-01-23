import { useMemo } from "react";
import { FragmentRouter } from "./FragmentRouter";
import FirstFragmentRoutes from "./FirstFragmentRoutes";
import SecondFragmentRoutes from "./SecondFragmentRoutes";

function App() {
  // Determine which component to render based on the current path or query parameter
  // The gateway transforms /second/ to /first/?_fragment=second, so we check both
  // This fragments app hosts both first-example and second-example fragments
  const isSecondFragment = useMemo(() => {
    const currentPath = globalThis.location.pathname;
    const searchParams = new URLSearchParams(globalThis.location.search);
    // Check both the path and the query parameter
    return (
      currentPath.startsWith("/second/") ||
      searchParams.get("_fragment") === "second"
    );
  }, []);

  return (
    <div>
      {isSecondFragment ? (
        <FragmentRouter fragmentId="second-example" basePath="/second">
          <SecondFragmentRoutes />
        </FragmentRouter>
      ) : (
        <FragmentRouter fragmentId="first-example" basePath="/first">
          <FirstFragmentRoutes />
        </FragmentRouter>
      )}
    </div>
  );
}

export default App;
