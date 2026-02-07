import {
  loadStaff,
  saveProjects,
  replaceProject,
} from "../../../data/projectsStorage";
import type { Project, Task } from "../../../data/projectsStorage";

export function createProject(
  name: string,
  description: string,
  _existingProjects: Project[],
): Project {
  const currentStaff = loadStaff();
  return {
    id: Date.now().toString(),
    name,
    description,
    tasks: [],
    staffIds: currentStaff.map((member) => member.id),
    createdAt: new Date().toISOString(),
  };
}

export function updateProjectNameAndDescription(
  project: Project,
  name: string,
  description: string,
): Project {
  return {
    ...project,
    name,
    description,
  };
}

export function addTaskToProject(project: Project, task: Task): Project {
  return {
    ...project,
    tasks: [...project.tasks, task],
  };
}

export function toggleTaskInProject(project: Project, taskId: string): Project {
  return {
    ...project,
    tasks: project.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    ),
  };
}

export function removeTaskFromProject(
  project: Project,
  taskId: string,
): Project {
  return {
    ...project,
    tasks: project.tasks.filter((task) => task.id !== taskId),
  };
}

export function addAssigneeToTask(
  project: Project,
  taskId: string,
  staffId: string,
): Project {
  return {
    ...project,
    tasks: project.tasks.map((task) =>
      task.id === taskId && !task.assigneeIds.includes(staffId)
        ? {
            ...task,
            assigneeIds: [...task.assigneeIds, staffId],
          }
        : task,
    ),
  };
}

export function removeAssigneeFromTask(
  project: Project,
  taskId: string,
  staffId: string,
): Project {
  return {
    ...project,
    tasks: project.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            assigneeIds: task.assigneeIds.filter((id) => id !== staffId),
          }
        : task,
    ),
  };
}

export function updateProjectsAndSave(
  projects: Project[],
  updatedProject: Project,
): Project[] {
  const updated = replaceProject(projects, updatedProject);
  saveProjects(updated);
  return updated;
}
