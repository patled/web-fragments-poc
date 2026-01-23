import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  loadProjects,
  replaceProject,
  saveProjects,
  loadStaff,
  saveStaff,
  initializeMockData,
  STORAGE_KEY,
  STAFF_STORAGE_KEY,
} from "../data/projectsStorage";
import type { Project, StaffMember, Task } from "../data/projectsStorage";

const ASSIGNMENTS_CHANNEL = "project-assignments-channel";
const ASSIGNMENTS_FRAGMENT_ID = "project-assignments";

interface DragStaffPayload {
  staffId: string;
  name: string;
  projectId: string;
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const assignmentsChannelRef = useRef<BroadcastChannel | null>(null);
  const draggedStaffPayloadRef = useRef<DragStaffPayload | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const assignmentCountByProject = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.id] = project.tasks.reduce(
        (total, task) => total + (task.assigneeIds?.length ?? 0),
        0,
      );
      return acc;
    }, {});
  }, [projects]);

  const staffById = useMemo(() => {
    return staff.reduce<Record<string, StaffMember>>((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});
  }, [staff]);

  const isAssignmentsRoute = location.pathname.startsWith("/assignments/");
  const shouldShowAssignmentsPanel = Boolean(
    isAssignmentsRoute && selectedProject,
  );

  useEffect(() => {
    const loadedProjects = loadProjects();
    const loadedStaff = loadStaff();
    setProjects(loadedProjects);
    setStaff(loadedStaff);

    if (projectId) {
      const project = loadedProjects.find((p) => p.id === projectId);
      setSelectedProject(project ?? null);
    } else {
      setSelectedProject(null);
    }
  }, [projectId]);

  useEffect(() => {
    const channel = new BroadcastChannel(ASSIGNMENTS_CHANNEL);
    assignmentsChannelRef.current = channel;

    const sendProjectToFragment = (project: Project) => {
      channel.postMessage({
        type: "assignments-project",
        fragmentId: ASSIGNMENTS_FRAGMENT_ID,
        projectId: project.id,
        payload: project,
        timestamp: new Date().toISOString(),
      });
    };

    const sendStaffToFragment = (members: StaffMember[]) => {
      channel.postMessage({
        type: "assignments-staff",
        fragmentId: ASSIGNMENTS_FRAGMENT_ID,
        payload: members,
        timestamp: new Date().toISOString(),
      });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "assignments-request" && event.data?.projectId) {
        const requested = projects.find(
          (project) => project.id === event.data.projectId,
        );
        if (requested) {
          sendProjectToFragment(requested);
        }
        sendStaffToFragment(staff);
        return;
      }

      if (
        event.data?.type === "staff-update" &&
        Array.isArray(event.data?.payload)
      ) {
        const updatedStaff = event.data.payload as StaffMember[];
        setStaff(updatedStaff);
        saveStaff(updatedStaff);
        return;
      }

      if (
        event.data?.type === "assignments-drag-staff" &&
        event.data?.payload
      ) {
        draggedStaffPayloadRef.current = event.data.payload as DragStaffPayload;
        return;
      }

      if (event.data?.type !== "assignments-update" || !event.data?.payload) {
        return;
      }

      const updatedProject = event.data.payload as Project;
      setProjects((prevProjects) => {
        const nextProjects = replaceProject(prevProjects, updatedProject);
        saveProjects(nextProjects);
        if (selectedProject?.id === updatedProject.id) {
          setSelectedProject(updatedProject);
        }
        return nextProjects;
      });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const updatedProjects = loadProjects();
        setProjects(updatedProjects);
        if (selectedProject) {
          const nextSelected = updatedProjects.find(
            (project) => project.id === selectedProject.id,
          );
          setSelectedProject(nextSelected ?? null);
        }
        return;
      }

      if (event.key === STAFF_STORAGE_KEY) {
        const updatedStaff = loadStaff();
        setStaff(updatedStaff);
      }
    };

    channel.addEventListener("message", handleMessage);
    globalThis.addEventListener("storage", handleStorage);

    if (shouldShowAssignmentsPanel && selectedProject) {
      sendProjectToFragment(selectedProject);
      sendStaffToFragment(staff);
    }

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      assignmentsChannelRef.current = null;
      globalThis.removeEventListener("storage", handleStorage);
    };
  }, [projects, selectedProject, shouldShowAssignmentsPanel, staff]);

  const handleCreateProject = () => {
    setIsCreating(true);
    setEditForm({ name: "", description: "" });
  };

  const handleSaveProject = () => {
    if (!editForm.name.trim()) return;

    const currentStaff = staff.length ? staff : loadStaff();
    const newProject: Project = {
      id: Date.now().toString(),
      name: editForm.name,
      description: editForm.description,
      tasks: [],
      staffIds: currentStaff.map((member) => member.id),
      createdAt: new Date().toISOString(),
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setIsCreating(false);
    setEditForm({ name: "", description: "" });
    navigate(`/projects/${newProject.id}`);
  };

  const handleEditProject = () => {
    if (!selectedProject || !editForm.name.trim()) return;

    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id
        ? { ...p, name: editForm.name, description: editForm.description }
        : p,
    );

    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setSelectedProject(
      updatedProjects.find((p) => p.id === selectedProject.id) || null,
    );
    setIsEditing(false);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("Möchten Sie dieses Projekt wirklich löschen?")) return;

    const updatedProjects = projects.filter((p) => p.id !== id);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    if (selectedProject?.id === id) {
      setSelectedProject(null);
      navigate("/projects");
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditing(false);
    if (isAssignmentsRoute) {
      navigate(`/assignments/${project.id}`);
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  const handleAddTask = (projectId: string) => {
    const taskTitle = prompt("Aufgaben-Titel:");
    if (!taskTitle?.trim()) return;

    const taskDescription = prompt("Aufgaben-Beschreibung (optional):") || "";

    const newTask: Task = {
      id: `${projectId}-${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      completed: false,
      assigneeIds: [],
    };

    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p,
    );

    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    if (selectedProject?.id === projectId) {
      setSelectedProject(
        updatedProjects.find((p) => p.id === projectId) || null,
      );
    }
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    const updatedProjects = projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === taskId ? { ...t, completed: !t.completed } : t,
            ),
          }
        : p,
    );

    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    if (selectedProject?.id === projectId) {
      setSelectedProject(
        updatedProjects.find((p) => p.id === projectId) || null,
      );
    }
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
    if (!confirm("Möchten Sie diese Aufgabe wirklich löschen?")) return;

    const updatedProjects = projects.map((p) =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
        : p,
    );

    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    if (selectedProject?.id === projectId) {
      setSelectedProject(
        updatedProjects.find((p) => p.id === projectId) || null,
      );
    }
  };

  const startEdit = () => {
    if (selectedProject) {
      setEditForm({
        name: selectedProject.name,
        description: selectedProject.description,
      });
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditForm({ name: "", description: "" });
  };

  const handleInitializeMockData = () => {
    initializeMockData();
    const loadedProjects = loadProjects();
    const loadedStaff = loadStaff();
    setProjects(loadedProjects);
    setStaff(loadedStaff);
    if (loadedProjects.length > 0) {
      setSelectedProject(loadedProjects[0]);
      navigate(`/projects/${loadedProjects[0].id}`);
    }
  };

  const handleTaskDrop = (event: DragEvent<HTMLElement>, task: Task) => {
    event.preventDefault();
    setDragOverTaskId(null);
    if (!selectedProject) return;
    const rawPayload = event.dataTransfer.getData("application/json");
    let payload = draggedStaffPayloadRef.current;
    if (rawPayload) {
      try {
        payload = JSON.parse(rawPayload) as DragStaffPayload;
      } catch {
        payload = draggedStaffPayloadRef.current;
      }
    }

    if (!payload || payload.projectId !== selectedProject.id) return;

    const updatedProject: Project = {
      ...selectedProject,
      tasks: selectedProject.tasks.map((currentTask) =>
        currentTask.id === task.id &&
        !currentTask.assigneeIds.includes(payload.staffId)
          ? {
              ...currentTask,
              assigneeIds: [...currentTask.assigneeIds, payload.staffId],
            }
          : currentTask,
      ),
    };

    setProjects((prevProjects) => {
      const nextProjects = replaceProject(prevProjects, updatedProject);
      saveProjects(nextProjects);
      return nextProjects;
    });
    setSelectedProject(updatedProject);
    assignmentsChannelRef.current?.postMessage({
      type: "assignments-update",
      fragmentId: ASSIGNMENTS_FRAGMENT_ID,
      projectId: updatedProject.id,
      payload: updatedProject,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRemoveAssignee = (taskId: string, staffId: string) => {
    if (!selectedProject) return;
    const updatedProject: Project = {
      ...selectedProject,
      tasks: selectedProject.tasks.map((currentTask) =>
        currentTask.id === taskId
          ? {
              ...currentTask,
              assigneeIds: currentTask.assigneeIds.filter(
                (id) => id !== staffId,
              ),
            }
          : currentTask,
      ),
    };

    setProjects((prevProjects) => {
      const nextProjects = replaceProject(prevProjects, updatedProject);
      saveProjects(nextProjects);
      return nextProjects;
    });
    setSelectedProject(updatedProject);
    assignmentsChannelRef.current?.postMessage({
      type: "assignments-update",
      fragmentId: ASSIGNMENTS_FRAGMENT_ID,
      projectId: updatedProject.id,
      payload: updatedProject,
      timestamp: new Date().toISOString(),
    });
  };

  const handleOpenAssignments = () => {
    if (!selectedProject) return;
    navigate(`/assignments/${selectedProject.id}`);
  };

  const handleCloseAssignments = () => {
    if (!selectedProject) {
      navigate("/projects");
      return;
    }
    navigate(`/projects/${selectedProject.id}`);
  };

  return (
    <div style={{ display: "flex", gap: "2rem", minHeight: "600px" }}>
      {/* Projekte-Liste */}
      <div style={{ flex: "0 0 300px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0 }}>Projekte</h2>
          <button
            onClick={handleCreateProject}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            + Neu
          </button>
        </div>

        {isCreating && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              backgroundColor: "#f9fafb",
            }}
          >
            <input
              type="text"
              placeholder="Projektname"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
              }}
            />
            <textarea
              placeholder="Beschreibung"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                minHeight: "60px",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleSaveProject}
                style={{
                  padding: "0.375rem 0.75rem",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Speichern
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  padding: "0.375rem 0.75rem",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {projects.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                border: "2px dashed #d1d5db",
                borderRadius: "0.5rem",
                textAlign: "center",
                backgroundColor: "#f9fafb",
              }}
            >
              <p style={{ margin: "0 0 1rem 0", color: "#6b7280" }}>
                No projects available yet.
              </p>
              <button
                onClick={handleInitializeMockData}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Create Sample Data
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelectProject(project)}
                type="button"
                style={{
                  padding: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  backgroundColor:
                    selectedProject?.id === project.id ? "#eff6ff" : "white",
                  borderColor:
                    selectedProject?.id === project.id ? "#3b82f6" : "#e5e7eb",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>
                  {project.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {project.description || "Keine Beschreibung"}
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                  }}
                >
                  {project.tasks.length} Aufgabe(n) {"·"}{" "}
                  {assignmentCountByProject[project.id] ?? 0} Zuweisung(en)
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Projekt-Detailansicht */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedProject ? (
            <div>
              {isEditing ? (
                <div
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Projektname"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      fontSize: "1.25rem",
                      fontWeight: "600",
                    }}
                  />
                  <textarea
                    placeholder="Beschreibung"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      minHeight: "100px",
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={handleEditProject}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                      }}
                    >
                      Speichern
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div>
                      <h1 style={{ margin: "0 0 0.5rem 0" }}>
                        {selectedProject.name}
                      </h1>
                      <p style={{ margin: 0, color: "#6b7280" }}>
                        {selectedProject.description || "Keine Beschreibung"}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={startEdit}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                        }}
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={handleOpenAssignments}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#0ea5e9",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                        }}
                      >
                        Zuweisungen
                      </button>
                      <button
                        onClick={() => handleDeleteProject(selectedProject.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                        }}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                        Aufgaben
                      </h2>
                      <button
                        onClick={() => handleAddTask(selectedProject.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        + Aufgabe hinzufügen
                      </button>
                    </div>

                    {selectedProject.tasks.length === 0 ? (
                      <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                        Noch keine Aufgaben vorhanden.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        {selectedProject.tasks.map((task) => (
                          <div
                            key={task.id}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setDragOverTaskId(task.id);
                            }}
                            onDragLeave={() =>
                              setDragOverTaskId((current) =>
                                current === task.id ? null : current,
                              )
                            }
                            onDrop={(event) => handleTaskDrop(event, task)}
                            style={{
                              padding: "1rem",
                              border: "1px solid",
                              borderColor:
                                dragOverTaskId === task.id
                                  ? "#0ea5e9"
                                  : "#e5e7eb",
                              borderRadius: "0.5rem",
                              backgroundColor: task.completed
                                ? "#f0fdf4"
                                : "white",
                              textAlign: "left",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() =>
                                  handleToggleTask(selectedProject.id, task.id)
                                }
                                style={{
                                  marginTop: "0.25rem",
                                  cursor: "pointer",
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <h3
                                  style={{
                                    margin: "0 0 0.25rem 0",
                                    fontSize: "1rem",
                                    textDecoration: task.completed
                                      ? "line-through"
                                      : "none",
                                    color: task.completed
                                      ? "#9ca3af"
                                      : "inherit",
                                  }}
                                >
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: "0.875rem",
                                      color: "#6b7280",
                                    }}
                                  >
                                    {task.description}
                                  </p>
                                )}
                                {task.assigneeIds.length > 0 && (
                                  <div style={{ marginTop: "0.5rem" }}>
                                    <div
                                      style={{
                                        fontSize: "0.75rem",
                                        color: "#4b5563",
                                        marginBottom: "0.25rem",
                                      }}
                                    >
                                      Assigned to
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.4rem",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      {task.assigneeIds.map((assigneeId) => (
                                        <button
                                          key={assigneeId}
                                          type="button"
                                          onClick={() =>
                                            handleRemoveAssignee(
                                              task.id,
                                              assigneeId,
                                            )
                                          }
                                          style={{
                                            border: "1px solid #d1d5db",
                                            borderRadius: "999px",
                                            padding: "0.2rem 0.5rem",
                                            backgroundColor: "white",
                                            fontSize: "0.75rem",
                                            cursor: "pointer",
                                          }}
                                        >
                                          {staffById[assigneeId]?.name ??
                                            "Unknown"}{" "}
                                          ×
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  handleDeleteTask(selectedProject.id, task.id)
                                }
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  backgroundColor: "#fee2e2",
                                  color: "#dc2626",
                                  border: "none",
                                  borderRadius: "0.375rem",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9ca3af",
              }}
            >
              <p>
                Wählen Sie ein Projekt aus der Liste aus oder erstellen Sie ein
                neues.
              </p>
            </div>
          )}
        </div>

        {shouldShowAssignmentsPanel && (
          <div
            style={{
              width: "360px",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              backgroundColor: "white",
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
              display: "flex",
              flexDirection: "column",
              alignSelf: "stretch",
              minHeight: "600px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Assignments</h2>
              </div>
              <button
                onClick={handleCloseAssignments}
                style={{
                  padding: "0.4rem 0.6rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {selectedProject && (
                <web-fragment
                  key={`${selectedProject.id}-assignments`}
                  fragment-id={ASSIGNMENTS_FRAGMENT_ID}
                ></web-fragment>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
