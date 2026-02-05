import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { HomePage } from "./components/home";
import { LoginPage } from "./components/LoginPage";
import { Navigation } from "./components/Navigation";
import { ProjectsPage } from "./components/ProjectsPage";
import { ShowcaseFragmentPage } from "./components/ShowcaseFragmentPage";

function AppContent() {
  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: "2.5rem",
        background: "var(--color-bg-page)",
        color: "var(--color-text)",
      }}
    >
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthenticatedTemplate>
        <AppContent />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <main
          style={{
            fontFamily: "system-ui",
            padding: "2.5rem",
            background: "var(--color-bg-page)",
            color: "var(--color-text)",
          }}
        >
          <LoginPage />
        </main>
      </UnauthenticatedTemplate>
    </BrowserRouter>
  );
}

export default App;
