import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  loadProjects,
  loadStaff,
  saveProjects,
  initializeMockData,
  STORAGE_KEY,
  STAFF_STORAGE_KEY,
} from "../../../data/projectsStorage";
import type { Project, StaffMember } from "../../../data/projectsStorage";

export function useProjects() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

    globalThis.addEventListener("storage", handleStorage);
    return () => {
      globalThis.removeEventListener("storage", handleStorage);
    };
  }, [selectedProject]);

  const updateProjects = (updater: (prev: Project[]) => Project[]) => {
    setProjects((prev) => {
      const next = updater(prev);
      saveProjects(next);
      return next;
    });
  };

  const updateProject = (updatedProject: Project) => {
    updateProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

  const initializeMock = () => {
    initializeMockData();
    const loadedProjects = loadProjects();
    const loadedStaff = loadStaff();
    setProjects(loadedProjects);
    setStaff(loadedStaff);
    return loadedProjects;
  };

  return {
    projects,
    staff,
    selectedProject,
    setProjects,
    setStaff,
    setSelectedProject,
    updateProjects,
    updateProject,
    initializeMock,
  };
}
