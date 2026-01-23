export interface StaffMember {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  assigneeIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  staffIds: string[];
  createdAt: string;
}

export const STORAGE_KEY = "projects";
export const STAFF_STORAGE_KEY = "staff";

const EXAMPLE_STAFF: StaffMember[] = [
  { id: "staff-1", name: "Lea Nguyen" },
  { id: "staff-2", name: "Markus Klein" },
  { id: "staff-3", name: "Maya Fischer" },
  { id: "staff-4", name: "Julian Weber" },
  { id: "staff-5", name: "Sofia Hartmann" },
  { id: "staff-6", name: "Tobias Richter" },
];

const EXAMPLE_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Modernisierung der Unternehmenswebsite",
    createdAt: new Date().toISOString(),
    staffIds: ["staff-1", "staff-2", "staff-3"],
    tasks: [
      {
        id: "1-1",
        title: "Design Mockups erstellen",
        description: "Erstelle erste Design-Mockups für die neue Website",
        completed: false,
        assigneeIds: ["staff-1", "staff-2"],
      },
      {
        id: "1-2",
        title: "Responsive Layout implementieren",
        description: "Sorge für mobile Optimierung",
        completed: false,
        assigneeIds: [],
      },
      {
        id: "1-3",
        title: "Content Management System einrichten",
        description: "CMS für einfache Content-Verwaltung",
        completed: true,
        assigneeIds: ["staff-3"],
      },
    ],
  },
  {
    id: "2",
    name: "Mobile App Entwicklung",
    description: "Entwicklung einer iOS und Android App",
    createdAt: new Date().toISOString(),
    staffIds: ["staff-4", "staff-2"],
    tasks: [
      {
        id: "2-1",
        title: "API Integration",
        description: "Backend-API in die App integrieren",
        completed: false,
        assigneeIds: ["staff-4"],
      },
      {
        id: "2-2",
        title: "Push Notifications",
        description: "Push-Benachrichtigungen implementieren",
        completed: false,
        assigneeIds: [],
      },
    ],
  },
  {
    id: "3",
    name: "Datenbank Migration",
    description: "Migration von MySQL zu PostgreSQL",
    createdAt: new Date().toISOString(),
    staffIds: ["staff-5", "staff-6"],
    tasks: [
      {
        id: "3-1",
        title: "Daten exportieren",
        description: "Alle Daten aus MySQL exportieren",
        completed: true,
        assigneeIds: ["staff-5"],
      },
      {
        id: "3-2",
        title: "Schema anpassen",
        description: "Datenbankschema für PostgreSQL anpassen",
        completed: false,
        assigneeIds: ["staff-6"],
      },
      {
        id: "3-3",
        title: "Daten importieren",
        description: "Daten in PostgreSQL importieren",
        completed: false,
        assigneeIds: [],
      },
    ],
  },
];

function normalizeStaffMember(raw: Partial<StaffMember>): StaffMember {
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name ?? "Unbekannt",
  };
}

function normalizeStaff(rawStaff: StaffMember[]): StaffMember[] {
  const seen = new Set<string>();
  return rawStaff
    .map((staff) => normalizeStaffMember(staff))
    .filter((staff) => {
      if (!staff.name.trim()) {
        return false;
      }
      if (seen.has(staff.id)) {
        return false;
      }
      seen.add(staff.id);
      return true;
    });
}

function findOrCreateStaffByName(
  staffMembers: StaffMember[],
  name: string,
  fallbackId?: string,
): StaffMember {
  const normalizedName = name.trim();
  const existing = staffMembers.find(
    (staff) => staff.name.toLowerCase() === normalizedName.toLowerCase(),
  );
  if (existing) {
    return existing;
  }
  const next = {
    id: fallbackId ?? crypto.randomUUID(),
    name: normalizedName,
  };
  staffMembers.push(next);
  return next;
}

function extractAssigneeIds(
  task: Partial<Task> & { assignees?: Array<{ id?: string; name?: string }> },
  staffMembers: StaffMember[],
): string[] {
  if (Array.isArray(task.assigneeIds)) {
    return task.assigneeIds.filter(Boolean);
  }

  if (!Array.isArray(task.assignees)) {
    return [];
  }

  return task.assignees
    .map((assignee) => {
      if (!assignee) {
        return null;
      }
      if (assignee.id) {
        const staff = findOrCreateStaffByName(
          staffMembers,
          assignee.name ?? "Unbekannt",
          assignee.id,
        );
        return staff.id;
      }
      if (assignee.name) {
        return findOrCreateStaffByName(staffMembers, assignee.name).id;
      }
      return null;
    })
    .filter((id): id is string => id !== null && id !== undefined && id !== "");
}

function normalizeTask(
  task: Partial<Task> & { assignees?: Array<{ id?: string; name?: string }> },
  staffMembers: StaffMember[],
): Task {
  return {
    id: task.id ?? crypto.randomUUID(),
    title: task.title ?? "",
    description: task.description ?? "",
    completed: Boolean(task.completed),
    assigneeIds: extractAssigneeIds(task, staffMembers),
  };
}

function normalizeProject(
  project: Partial<Project> & { tasks?: Array<Partial<Task>> },
  staffMembers: StaffMember[],
): Project {
  const tasks = Array.isArray(project.tasks)
    ? project.tasks.map((task) => normalizeTask(task, staffMembers))
    : [];

  const staffIds = Array.isArray(project.staffIds)
    ? project.staffIds
    : Array.from(
        new Set(
          tasks.flatMap((task) => task.assigneeIds).filter(Boolean),
        ),
      );

  return {
    id: project.id ?? crypto.randomUUID(),
    name: project.name ?? "",
    description: project.description ?? "",
    createdAt: project.createdAt ?? new Date().toISOString(),
    staffIds,
    tasks,
  };
}

export function loadStaff(): StaffMember[] {
  const stored = localStorage.getItem(STAFF_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(EXAMPLE_STAFF));
    return EXAMPLE_STAFF;
  }

  try {
    const parsed = JSON.parse(stored) as StaffMember[];
    const normalized = normalizeStaff(parsed);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn("Failed to parse staff from storage, resetting.", error);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(EXAMPLE_STAFF));
    return EXAMPLE_STAFF;
  }
}

export function saveStaff(staffMembers: StaffMember[]): void {
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffMembers));
}

export function loadProjects(): Project[] {
  const staffMembers = loadStaff();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(EXAMPLE_PROJECTS));
    return EXAMPLE_PROJECTS;
  }

  try {
    const parsed = JSON.parse(stored) as Project[];
    const normalized = parsed.map((project) =>
      normalizeProject(project, staffMembers),
    );
    const normalizedStaff = normalizeStaff(staffMembers);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(normalizedStaff));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn("Failed to parse projects from storage, resetting.", error);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(EXAMPLE_STAFF));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(EXAMPLE_PROJECTS));
    return EXAMPLE_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function replaceProject(projects: Project[], updatedProject: Project): Project[] {
  return projects.map((project) =>
    project.id === updatedProject.id ? updatedProject : project,
  );
}
