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

export function getMockProject(projectId: string | undefined): Project | null {
  if (!projectId) return null;
  return MOCK_PROJECTS.find((p) => p.id === projectId) ?? MOCK_PROJECTS[0] ?? null;
}

export function getMockStaff(): StaffMember[] {
  return MOCK_STAFF;
}
