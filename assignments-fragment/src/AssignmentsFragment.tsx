import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useParams } from "react-router-dom";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface StaffMember {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  assigneeIds: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  staffIds: string[];
  createdAt: string;
}

interface DragStaffPayload {
  staffId: string;
  name: string;
  projectId: string;
}

const ASSIGNMENTS_CHANNEL = "project-assignments-channel";
const ASSIGNMENTS_FRAGMENT_ID = "project-assignments";

export default function AssignmentsFragment() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(ASSIGNMENTS_CHANNEL);
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "assignments-project" &&
        event.data?.projectId === projectId
      ) {
        setProject(event.data.payload as Project);
      }

      if (
        event.data?.type === "assignments-staff" &&
        Array.isArray(event.data?.payload)
      ) {
        setStaff(event.data.payload as StaffMember[]);
      }

      if (
        event.data?.type === "assignments-update" &&
        event.data?.projectId === projectId
      ) {
        setProject(event.data.payload as Project);
      }

      if (
        event.data?.type === "staff-update" &&
        Array.isArray(event.data?.payload)
      ) {
        setStaff(event.data.payload as StaffMember[]);
      }
    };

    channel.addEventListener("message", handleMessage);

    if (projectId) {
      channel.postMessage({
        type: "assignments-request",
        fragmentId: ASSIGNMENTS_FRAGMENT_ID,
        projectId,
        timestamp: new Date().toISOString(),
      });
    }

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [projectId]);

  const activeTaskCountByStaff = useMemo(() => {
    if (!project) return {};
    return staff.reduce<Record<string, number>>((acc, member) => {
      acc[member.id] = project.tasks.filter(
        (task) => !task.completed && task.assigneeIds.includes(member.id),
      ).length;
      return acc;
    }, {});
  }, [project, staff]);

  const handleStaffDragStart = (
    event: DragEvent<HTMLElement>,
    member: StaffMember,
  ) => {
    if (!project) return;
    const payload: DragStaffPayload = {
      staffId: member.id,
      name: member.name,
      projectId: project.id,
    };
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", member.name);
    event.dataTransfer.effectAllowed = "copy";
    channelRef.current?.postMessage({
      type: "assignments-drag-staff",
      fragmentId: ASSIGNMENTS_FRAGMENT_ID,
      payload,
      timestamp: new Date().toISOString(),
    });
  };

  if (!projectId) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h6" gutterBottom>
          No project selected
        </Typography>
        <Typography color="text.secondary">
          Open a project and the assignments panel to see the team.
        </Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h6" gutterBottom>
          Loading project…
        </Typography>
        <Typography color="text.secondary">
          Waiting for the project data from the shell.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2.5 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{project.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Drag a staff member onto a task in the project list to assign work.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={1}>
          {staff.map((member) => (
            <Stack
              key={member.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Chip
                label={member.name}
                draggable
                onDragStart={(event) => handleStaffDragStart(event, member)}
                sx={{ cursor: "grab" }}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                Active tasks: {activeTaskCountByStaff[member.id] ?? 0}
              </Typography>
            </Stack>
          ))}
          {staff.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No staff members available yet.
            </Typography>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
