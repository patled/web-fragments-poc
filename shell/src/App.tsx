import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./components/HomePage";
import { FragmentPage } from "./components/FragmentPage";
import { Navigation } from "./components/Navigation";

function App() {
  return (
    <BrowserRouter>
      <main style={{ fontFamily: "system-ui", padding: "2.5rem" }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/first" element={<Navigate to="/first/" replace />} />
          <Route
            path="/first/"
            element={<FragmentPage key="first-example" fragmentId="first-example" basePath="/first" />}
          />
          <Route
            path="/first/*"
            element={<FragmentPage key="first-example" fragmentId="first-example" basePath="/first" />}
          />
          <Route path="/second" element={<Navigate to="/second/" replace />} />
          <Route
            path="/second/"
            element={<FragmentPage key="second-example" fragmentId="second-example" basePath="/second" />}
          />
          <Route
            path="/second/*"
            element={<FragmentPage key="second-example" fragmentId="second-example" basePath="/second" />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
