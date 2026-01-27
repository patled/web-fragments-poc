import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const location = useLocation();
  const isProjectsRoute = location.pathname.startsWith("/projects");
  const isShowcaseRoute = location.pathname.startsWith("/showcase");

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
          to="/projects"
          style={{
            textDecoration: "none",
            color: isProjectsRoute ? "var(--color-link-active)" : "var(--color-text-secondary)",
            fontWeight: isProjectsRoute ? "600" : "400",
          }}
        >
          Projects
        </Link>
        <Link
          to="/showcase"
          style={{
            textDecoration: "none",
            color: isShowcaseRoute ? "var(--color-link-active)" : "var(--color-text-secondary)",
            fontWeight: isShowcaseRoute ? "600" : "400",
          }}
        >
          Showcase
        </Link>
      </div>
    </nav>
  );
}
