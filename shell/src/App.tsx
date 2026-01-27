import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./components/HomePage";
import { Navigation } from "./components/Navigation";
import { ProjectsPage } from "./components/ProjectsPage";
import { ShowcaseFragmentPage } from "./components/ShowcaseFragmentPage";

function App() {
  return (
    <BrowserRouter>
      <main style={{ fontFamily: "system-ui", padding: "2.5rem", background: "var(--color-bg-page)", color: "var(--color-text)" }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/showcase" element={<ShowcaseFragmentPage />} />
          <Route path="/showcase/*" element={<ShowcaseFragmentPage />} />
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
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
