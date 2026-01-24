import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext";

export function Navigation() {
  const location = useLocation();
  const { mode, toggleTheme } = useTheme();
  const isFirstRoute = location.pathname.startsWith("/first");
  const isSecondRoute = location.pathname.startsWith("/second");
  const isProjectsRoute = location.pathname.startsWith("/projects");

  return (
    <nav
      style={{
        marginBottom: "2rem",
        padding: "1rem",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-nav)",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: location.pathname === "/" ? "var(--color-link-active)" : "var(--color-text-secondary)",
            fontWeight: location.pathname === "/" ? "600" : "400",
          }}
        >
          Home
        </Link>
        <Link
          to="/first/"
          style={{
            textDecoration: "none",
            color: isFirstRoute ? "var(--color-link-active)" : "var(--color-text-secondary)",
            fontWeight: isFirstRoute ? "600" : "400",
          }}
        >
          Open the first fragment
        </Link>
        <Link
          to="/second/"
          style={{
            textDecoration: "none",
            color: isSecondRoute ? "var(--color-link-active)" : "var(--color-text-secondary)",
            fontWeight: isSecondRoute ? "600" : "400",
          }}
        >
          Open the second fragment
        </Link>
        <Link
          to="/projects"
          style={{
            textDecoration: "none",
            color: isProjectsRoute ? "var(--color-link-active)" : "var(--color-text-secondary)",
            fontWeight: isProjectsRoute ? "600" : "400",
          }}
        >
          Projects
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            marginLeft: "auto",
            padding: "0.35rem 0.6rem",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "0.375rem",
            backgroundColor: "var(--color-bg-surface)",
            color: "var(--color-text)",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
          title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mode === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </nav>
  );
}
