import { useMemo, useRef, useState, useCallback } from "react";
import type { DragEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveStaff, saveProjects } from "../data/projectsStorage";
import type { Project, StaffMember, Task } from "../data/projectsStorage";
import { useProjects } from "./projects/hooks/useProjects";
import { useAssignmentsChannel } from "./projects/hooks/useAssignmentsChannel";
import { ProjectList } from "./projects/ProjectList";
import { ProjectForm } from "./projects/ProjectForm";
import { ProjectDetail } from "./projects/ProjectDetail";
import { AssignmentsPanel } from "./projects/AssignmentsPanel";
import { styles } from "./projects/styles";
import {
  createProject,
  updateProjectNameAndDescription,
  addTaskToProject,
  toggleTaskInProject,
  removeTaskFromProject,
  addAssigneeToTask,
  removeAssigneeFromTask,
  updateProjectsAndSave,
} from "./projects/utils/projectUtils";
import type { DragStaffPayload } from "./projects/types";
import { ASSIGNMENTS_FRAGMENT_ID } from "./projects/types";

export function ProjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    projects,
    staff,
    selectedProject,
    setProjects,
    setStaff,
    setSelectedProject,
    updateProjects,
    updateProject,
    initializeMock,
  } = useProjects();

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
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

  const isAssignmentsRoute =
    location.pathname.startsWith("/assignments/") ||
    /^\/projects\/[^/]+\/assignments(\/|$)/.test(location.pathname);
  const shouldShowAssignmentsPanel = Boolean(
    isAssignmentsRoute && selectedProject,
  );

  const handleProjectsUpdate = useCallback(
    (updatedProject: Project) => {
      updateProject(updatedProject);
    },
    [updateProject],
  );

  const handleStaffUpdate = useCallback(
    (updatedStaff: StaffMember[]) => {
      setStaff(updatedStaff);
      saveStaff(updatedStaff);
    },
    [setStaff],
  );

  const handleDragStaff = useCallback((payload: DragStaffPayload) => {
    draggedStaffPayloadRef.current = payload;
  }, []);

  const assignmentsChannelRef = useAssignmentsChannel({
    projects,
    staff,
    selectedProject,
    shouldShowAssignmentsPanel,
    onProjectsUpdate: handleProjectsUpdate,
    onStaffUpdate: handleStaffUpdate,
    onDragStaff: handleDragStaff,
  });

  const handleCreateProject = () => {
    setIsCreating(true);
    setEditForm({ name: "", description: "" });
  };

  const handleSaveProject = () => {
    if (!editForm.name.trim()) return;

    const newProject = createProject(
      editForm.name,
      editForm.description,
      projects,
    );

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setIsCreating(false);
    setEditForm({ name: "", description: "" });
    navigate(`/projects/${newProject.id}`);
  };

  const handleEditProject = () => {
    if (!selectedProject || !editForm.name.trim()) return;

    const updatedProject = updateProjectNameAndDescription(
      selectedProject,
      editForm.name,
      editForm.description,
    );

    updateProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
    setSelectedProject(updatedProject);
    setIsEditing(false);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    updateProjects((prev) => prev.filter((p) => p.id !== id));

    if (selectedProject?.id === id) {
      setSelectedProject(null);
      navigate("/projects");
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditing(false);
    if (isAssignmentsRoute) {
      navigate(`/projects/${project.id}/assignments`);
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  const handleAddTask = (projectId: string) => {
    const taskTitle = prompt("Task title:");
    if (!taskTitle?.trim()) return;

    const taskDescription = prompt("Task description (optional):") || "";

    const newTask: Task = {
      id: `${projectId}-${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      completed: false,
      assigneeIds: [],
    };

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedProject = addTaskToProject(project, newTask);
    const updatedProjects = updateProjectsAndSave(projects, updatedProject);
    setProjects(updatedProjects);

    if (selectedProject?.id === projectId) {
      setSelectedProject(updatedProject);
    }
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedProject = toggleTaskInProject(project, taskId);
    const updatedProjects = updateProjectsAndSave(projects, updatedProject);
    setProjects(updatedProjects);

    if (selectedProject?.id === projectId) {
      setSelectedProject(updatedProject);
    }
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedProject = removeTaskFromProject(project, taskId);
    const updatedProjects = updateProjectsAndSave(projects, updatedProject);
    setProjects(updatedProjects);

    if (selectedProject?.id === projectId) {
      setSelectedProject(updatedProject);
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
    const loadedProjects = initializeMock();
    setSelectedProject(loadedProjects[0]);
    navigate(`/projects/${loadedProjects[0].id}`);
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

    const updatedProject = addAssigneeToTask(
      selectedProject,
      task.id,
      payload.staffId,
    );

    const updatedProjects = updateProjectsAndSave(projects, updatedProject);
    setProjects(updatedProjects);
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

    const updatedProject = removeAssigneeFromTask(
      selectedProject,
      taskId,
      staffId,
    );

    const updatedProjects = updateProjectsAndSave(projects, updatedProject);
    setProjects(updatedProjects);
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
    navigate(`/projects/${selectedProject.id}/assignments`);
  };

  const handleCloseAssignments = () => {
    if (!selectedProject) {
      navigate("/projects");
      return;
    }
    navigate(`/projects/${selectedProject.id}`);
  };

  const handleTaskDragOver = (
    event: DragEvent<HTMLElement>,
    taskId: string,
  ) => {
    event.preventDefault();
    setDragOverTaskId(taskId);
  };

  const handleTaskDragLeave = (taskId: string) => {
    setDragOverTaskId((current) => (current === taskId ? null : current));
  };

  return (
    <div style={styles.container}>
      <ProjectList
        projects={projects}
        selectedProject={selectedProject}
        assignmentCountByProject={assignmentCountByProject}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onInitializeMockData={handleInitializeMockData}
      />

      <div style={styles.projectDetail}>
        <div style={styles.projectDetailContent}>
          {isCreating && (
            <ProjectForm
              name={editForm.name}
              description={editForm.description}
              onNameChange={(name) =>
                setEditForm({ ...editForm, name })
              }
              onDescriptionChange={(description) =>
                setEditForm({ ...editForm, description })
              }
              onSave={handleSaveProject}
              onCancel={cancelEdit}
            />
          )}

          {selectedProject ? (
            <ProjectDetail
              project={selectedProject}
              staffById={staffById}
              isEditing={isEditing}
              editForm={editForm}
              dragOverTaskId={dragOverTaskId}
              onEdit={startEdit}
              onSaveEdit={handleEditProject}
              onCancelEdit={cancelEdit}
              onNameChange={(name) =>
                setEditForm({ ...editForm, name })
              }
              onDescriptionChange={(description) =>
                setEditForm({ ...editForm, description })
              }
              onDelete={handleDeleteProject}
              onOpenAssignments={handleOpenAssignments}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onRemoveAssignee={handleRemoveAssignee}
              onTaskDragOver={handleTaskDragOver}
              onTaskDragLeave={handleTaskDragLeave}
              onTaskDrop={handleTaskDrop}
            />
          ) : (
            <div style={styles.centerMessage}>
              <p>Select a project from the list or create a new one.</p>
            </div>
          )}
        </div>

        {shouldShowAssignmentsPanel && selectedProject && (
          <AssignmentsPanel
            projectId={selectedProject.id}
            onClose={handleCloseAssignments}
          />
        )}
      </div>
    </div>
  );
}
