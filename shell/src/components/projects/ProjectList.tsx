import type { Project } from "../../data/projectsStorage";
import { styles } from "./styles";

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  assignmentCountByProject: Record<string, number>;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onInitializeMockData: () => void;
}

export function ProjectList({
  projects,
  selectedProject,
  assignmentCountByProject,
  onSelectProject,
  onCreateProject,
  onInitializeMockData,
}: ProjectListProps) {
  return (
    <div style={styles.projectsList}>
      <div style={styles.projectsHeader}>
        <h2 style={{ margin: 0 }}>Projects</h2>
        <button onClick={onCreateProject} style={styles.button}>
          + New
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateText}>No projects available yet.</p>
            <button
              onClick={onInitializeMockData}
              style={styles.emptyStateButton}
            >
              Create Sample Data
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              type="button"
              style={styles.projectCard(selectedProject?.id === project.id)}
            >
              <h3 style={styles.projectCardTitle}>{project.name}</h3>
              <p style={styles.projectCardDescription}>
                {project.description || "No description"}
              </p>
              <p style={styles.projectCardMeta}>
                {project.tasks.length} task(s) {"·"}{" "}
                {assignmentCountByProject[project.id] ?? 0} assignment(s)
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
