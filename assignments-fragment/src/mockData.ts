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

export const MOCK_STAFF: StaffMember[] = [
  { id: "staff-1", name: "Lea Nguyen" },
  { id: "staff-2", name: "Markus Klein" },
  { id: "staff-3", name: "Maya Fischer" },
  { id: "staff-4", name: "Julian Weber" },
  { id: "staff-5", name: "Sofia Hartmann" },
  { id: "staff-6", name: "Tobias Richter" },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Modernization of the company website",
    createdAt: new Date().toISOString(),
    staffIds: ["staff-1", "staff-2", "staff-3"],
    tasks: [
      {
        id: "1-1",
        title: "Create design mockups",
        description: "Create initial design mockups for the new website",
        completed: false,
        assigneeIds: ["staff-1", "staff-2"],
      },
      {
        id: "1-2",
        title: "Implement responsive layout",
        description: "Ensure mobile optimization",
        completed: false,
        assigneeIds: [],
      },
      {
        id: "1-3",
        title: "Set up content management system",
        description: "CMS for easy content management",
        completed: true,
        assigneeIds: ["staff-3"],
      },
    ],
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Development of an iOS and Android app",
    createdAt: new Date().toISOString(),
    staffIds: ["staff-4", "staff-2"],
    tasks: [
      {
        id: "2-1",
        title: "API Integration",
        description: "Integrate backend API into the app",
        completed: false,
        assigneeIds: ["staff-4"],
      },
      {
        id: "2-2",
        title: "Push Notifications",
        description: "Implement push notifications",
        completed: false,
        assigneeIds: [],
      },
    ],
  },
  {
    id: "3",
    name: "Database Migration",
    description: "Migration from MySQL to PostgreSQL",
    createdAt: new Date().toISOString(),
    staffIds: ["staff-5", "staff-6"],
    tasks: [
      {
        id: "3-1",
        title: "Export data",
        description: "Export all data from MySQL",
        completed: true,
        assigneeIds: ["staff-5"],
      },
      {
        id: "3-2",
        title: "Adapt schema",
        description: "Adapt database schema for PostgreSQL",
        completed: false,
        assigneeIds: ["staff-6"],
      },
      {
        id: "3-3",
        title: "Import data",
        description: "Import data into PostgreSQL",
        completed: false,
        assigneeIds: [],
      },
    ],
  },
];

export function getMockProject(projectId: string | undefined): Project | null {
  if (!projectId) return null;
  return MOCK_PROJECTS.find((p) => p.id === projectId) ?? MOCK_PROJECTS[0] ?? null;
}

export function getMockStaff(): StaffMember[] {
  return MOCK_STAFF;
}
