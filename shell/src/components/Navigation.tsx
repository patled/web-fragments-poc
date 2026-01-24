import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const location = useLocation();
  const isFirstRoute = location.pathname.startsWith("/first");
  const isSecondRoute = location.pathname.startsWith("/second");
  const isProjectsRoute = location.pathname.startsWith("/projects");

  return (
    <nav
      style={{
        marginBottom: "2rem",
        padding: "1rem",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: location.pathname === "/" ? "#3b82f6" : "#4b5563",
            fontWeight: location.pathname === "/" ? "600" : "400",
          }}
        >
          Home
        </Link>
        <Link
          to="/first/"
          style={{
            textDecoration: "none",
            color: isFirstRoute ? "#3b82f6" : "#4b5563",
            fontWeight: isFirstRoute ? "600" : "400",
          }}
        >
          Open the first fragment
        </Link>
        <Link
          to="/second/"
          style={{
            textDecoration: "none",
            color: isSecondRoute ? "#3b82f6" : "#4b5563",
            fontWeight: isSecondRoute ? "600" : "400",
          }}
        >
          Open the second fragment
        </Link>
        <Link
          to="/projects"
          style={{
            textDecoration: "none",
            color: isProjectsRoute ? "#3b82f6" : "#4b5563",
            fontWeight: isProjectsRoute ? "600" : "400",
          }}
        >
          Projects
        </Link>
      </div>
    </nav>
  );
}
