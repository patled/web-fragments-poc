import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./components/HomePage";
import { FragmentPage } from "./components/FragmentPage";
import { Navigation } from "./components/Navigation";
import { ProjectsPage } from "./components/ProjectsPage";

function App() {
  return (
    <BrowserRouter>
      <main style={{ fontFamily: "system-ui", padding: "2.5rem", background: "var(--color-bg-page)", color: "var(--color-text)" }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route
            path="/projects/:projectId/assignments"
            element={<ProjectsPage />}
          />
          <Route
            path="/projects/:projectId/assignments/*"
            element={<ProjectsPage />}
          />
          <Route path="/projects/:projectId" element={<ProjectsPage />} />
          <Route path="/assignments/:projectId" element={<ProjectsPage />} />
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
