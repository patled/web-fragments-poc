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
    name: "Office Pizza Party Planning",
    description: "Organize the ultimate Friday afternoon pizza extravaganza",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    staffIds: ["staff-1", "staff-2", "staff-3"],
    tasks: [
      {
        id: "1-1",
        title: "Survey team for pizza preferences",
        description: "Find out who wants pineapple (and who needs to be fired)",
        completed: true,
        assigneeIds: ["staff-1"],
      },
      {
        id: "1-2",
        title: "Negotiate with pizza place",
        description: "Try to get free garlic bread (mission impossible)",
        completed: false,
        assigneeIds: ["staff-2"],
      },
      {
        id: "1-3",
        title: "Book conference room",
        description: "Make sure it's the one with the good projector",
        completed: true,
        assigneeIds: ["staff-3"],
      },
      {
        id: "1-4",
        title: "Create 'Pizza Time' playlist",
        description: "Must include 'That's Amore' by Dean Martin",
        completed: false,
        assigneeIds: [],
      },
    ],
  },
  {
    id: "2",
    name: "The Great Coffee Machine Investigation",
    description: "Find out why the coffee machine keeps making that weird noise",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    staffIds: ["staff-4", "staff-5"],
    tasks: [
      {
        id: "2-1",
        title: "Document the weird noise",
        description: "Record audio and compare with whale songs",
        completed: true,
        assigneeIds: ["staff-4"],
      },
      {
        id: "2-2",
        title: "Check if it's haunted",
        description: "Consult with IT department (they know about ghosts)",
        completed: false,
        assigneeIds: ["staff-5"],
      },
      {
        id: "2-3",
        title: "Test all coffee settings",
        description: "Drink 47 cups of coffee for science",
        completed: false,
        assigneeIds: ["staff-4"],
      },
    ],
  },
  {
    id: "3",
    name: "Company Meme Creation Initiative",
    description: "Develop official company memes to boost morale (and confuse HR)",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    staffIds: ["staff-1", "staff-3", "staff-6"],
    tasks: [
      {
        id: "3-1",
        title: "Research trending meme formats",
        description: "Watch TikTok for 3 hours (it's research, I swear)",
        completed: true,
        assigneeIds: ["staff-1"],
      },
      {
        id: "3-2",
        title: "Create 'Drake pointing' meme about code reviews",
        description: "Drake disapproves: messy code. Drake approves: clean code",
        completed: true,
        assigneeIds: ["staff-3"],
      },
      {
        id: "3-3",
        title: "Get legal approval",
        description: "Explain to lawyers why memes are important for business",
        completed: false,
        assigneeIds: ["staff-6"],
      },
      {
        id: "3-4",
        title: "Launch meme campaign",
        description: "Post memes in Slack and watch the chaos unfold",
        completed: false,
        assigneeIds: [],
      },
    ],
  },
  {
    id: "4",
    name: "Office Plant Survival Program",
    description: "Keep the office plants alive (they're not doing well)",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    staffIds: ["staff-2", "staff-5", "staff-6"],
    tasks: [
      {
        id: "4-1",
        title: "Name all the plants",
        description: "Steve, Planty McPlantface, and The One That's Dying",
        completed: true,
        assigneeIds: ["staff-2"],
      },
      {
        id: "4-2",
        title: "Create watering schedule",
        description: "Set reminders so we don't forget again",
        completed: false,
        assigneeIds: ["staff-5"],
      },
      {
        id: "4-3",
        title: "Research plant care tips",
        description: "Google 'how to not kill plants'",
        completed: true,
        assigneeIds: ["staff-6"],
      },
      {
        id: "4-4",
        title: "Hold emergency plant meeting",
        description: "Discuss intervention strategies for the dying one",
        completed: false,
        assigneeIds: [],
      },
    ],
  },
  {
    id: "5",
    name: "The Quest for the Perfect Desk Snack",
    description: "Find snacks that satisfy hunger but don't make keyboard sticky",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    staffIds: ["staff-1", "staff-4"],
    tasks: [
      {
        id: "5-1",
        title: "Compile snack wishlist",
        description: "Everything from chips to chocolate (all healthy options)",
        completed: true,
        assigneeIds: ["staff-1"],
      },
      {
        id: "5-2",
        title: "Test snack keyboard compatibility",
        description: "Eat snacks while typing to check for stickiness",
        completed: false,
        assigneeIds: ["staff-4"],
      },
      {
        id: "5-3",
        title: "Create snack ranking system",
        description: "Rate snacks on taste, non-stickiness, and happiness factor",
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

export function initializeMockData(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(EXAMPLE_PROJECTS));
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(EXAMPLE_STAFF));
}

export function replaceProject(projects: Project[], updatedProject: Project): Project[] {
  return projects.map((project) =>
    project.id === updatedProject.id ? updatedProject : project,
  );
}
