import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadProjects,
  replaceProject,
  saveProjects,
} from "../data/projectsStorage";
import type { Project } from "../data/projectsStorage";

const ASSIGNMENTS_CHANNEL = "project-assignments-channel";
const ASSIGNMENTS_FRAGMENT_ID = "project-assignments";

export function AssignmentsFragmentPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadedProjects = loadProjects();
    const selected = loadedProjects.find((item) => item.id === projectId) ?? null;
    setProject(selected);
  }, [projectId]);

  useEffect(() => {
    const channel = new BroadcastChannel(ASSIGNMENTS_CHANNEL);

    const sendProject = (payload: Project) => {
      channel.postMessage({
        type: "assignments-project",
        fragmentId: ASSIGNMENTS_FRAGMENT_ID,
        projectId: payload.id,
        payload,
        timestamp: new Date().toISOString(),
      });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "assignments-request" && event.data?.projectId) {
        const loadedProjects = loadProjects();
        const selected =
          loadedProjects.find((item) => item.id === event.data.projectId) ?? null;
        if (selected) {
          sendProject(selected);
        }
      }

      if (event.data?.type === "assignments-update" && event.data?.payload) {
        const updatedProject = event.data.payload as Project;
        const loadedProjects = loadProjects();
        const nextProjects = replaceProject(loadedProjects, updatedProject);
        saveProjects(nextProjects);
        setProject(updatedProject);
      }
    };

    channel.addEventListener("message", handleMessage);

    if (project) {
      sendProject(project);
    }

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [project]);

  return (
    <>
      <section style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            ← Zurück
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Vergabe im Fragment</h1>
            <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280" }}>
              Projektzuweisungen werden ausschließlich im Fragment gepflegt.
            </p>
          </div>
        </div>
      </section>

      {project ? (
        <web-fragment
          key={project.id}
          fragment-id={ASSIGNMENTS_FRAGMENT_ID}
        ></web-fragment>
      ) : (
        <div style={{ color: "#9ca3af" }}>
          Kein Projekt gefunden. Bitte zurück zur Liste wechseln.
        </div>
      )}
    </>
  );
}
