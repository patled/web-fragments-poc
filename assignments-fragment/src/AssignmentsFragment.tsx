import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  getMockProject,
  getMockStaff,
  type Project,
  type StaffMember,
} from "./mockData";

interface DragStaffPayload {
  staffId: string;
  name: string;
  projectId: string;
}

const ASSIGNMENTS_CHANNEL = "project-assignments-channel";
const ASSIGNMENTS_FRAGMENT_ID = "project-assignments";
const STANDALONE_TIMEOUT_MS = 1000; // Timeout after 1s to wait for shell data

export default function AssignmentsFragment() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isStandalone, setIsStandalone] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const standaloneTimeoutRef = useRef<number | null>(null);
  const dataReceivedRef = useRef(false);

  // Check if standalone mode is enabled via URL parameter
  const forceStandalone = searchParams.get("standalone") === "true";

  useEffect(() => {
    // When standalone mode is forced, use mock data immediately
    if (forceStandalone) {
      setIsStandalone(true);
      const mockProject = getMockProject(projectId);
      setProject(mockProject);
      setStaff(getMockStaff());
      return;
    }

    const channel = new BroadcastChannel(ASSIGNMENTS_CHANNEL);
    channelRef.current = channel;
    dataReceivedRef.current = false;

    const handleMessage = (event: MessageEvent) => {
      dataReceivedRef.current = true;

      if (
        event.data?.type === "assignments-project" &&
        event.data?.projectId === projectId
      ) {
        setProject(event.data.payload as Project);
        setIsStandalone(false);
      }

      if (
        event.data?.type === "assignments-staff" &&
        Array.isArray(event.data?.payload)
      ) {
        setStaff(event.data.payload as StaffMember[]);
        setIsStandalone(false);
      }

      if (
        event.data?.type === "assignments-update" &&
        event.data?.projectId === projectId
      ) {
        setProject(event.data.payload as Project);
        setIsStandalone(false);
      }

      if (
        event.data?.type === "staff-update" &&
        Array.isArray(event.data?.payload)
      ) {
        setStaff(event.data.payload as StaffMember[]);
        setIsStandalone(false);
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

      // Set timeout: if no data received after 1s, use mock data for standalone mode
      standaloneTimeoutRef.current = window.setTimeout(() => {
        if (!dataReceivedRef.current) {
          console.log(
            "[AssignmentsFragment] No data received from shell, using mock data for standalone mode",
          );
          setIsStandalone(true);
          const mockProject = getMockProject(projectId);
          setProject(mockProject);
          setStaff(getMockStaff());
        }
      }, STANDALONE_TIMEOUT_MS);
    }

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channelRef.current = null;
      if (standaloneTimeoutRef.current !== null) {
        clearTimeout(standaloneTimeoutRef.current);
        standaloneTimeoutRef.current = null;
      }
    };
  }, [projectId, forceStandalone]);

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

  // In standalone mode: if no projectId, use the first mock project
  useEffect(() => {
    if (isStandalone && !projectId && !project) {
      const mockProject = getMockProject("1");
      if (mockProject) {
        setProject(mockProject);
        setStaff(getMockStaff());
      }
    }
  }, [isStandalone, projectId, project]);

  if (!projectId && !isStandalone) {
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
          {isStandalone
            ? "Loading mock project data for standalone mode…"
            : "Waiting for the project data from the shell."}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2.5 }}>
      <Stack spacing={2}>
        {isStandalone && (
          <Typography
            variant="caption"
            sx={{
              p: 1,
              bgcolor: "info.light",
              color: "info.dark",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "info.main",
            }}
          >
            🧪 Standalone mode: Mock data is being used
          </Typography>
        )}
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
