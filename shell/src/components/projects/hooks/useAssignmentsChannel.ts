import { useEffect, useRef } from "react";
import type { Project, StaffMember } from "../../../data/projectsStorage";
import type { DragStaffPayload } from "../types";
import { ASSIGNMENTS_CHANNEL, ASSIGNMENTS_FRAGMENT_ID } from "../types";

interface UseAssignmentsChannelProps {
  projects: Project[];
  staff: StaffMember[];
  selectedProject: Project | null;
  shouldShowAssignmentsPanel: boolean;
  onProjectsUpdate: (updatedProject: Project) => void;
  onStaffUpdate: (updatedStaff: StaffMember[]) => void;
  onDragStaff: (payload: DragStaffPayload) => void;
}

export function useAssignmentsChannel({
  projects,
  staff,
  selectedProject,
  shouldShowAssignmentsPanel,
  onProjectsUpdate,
  onStaffUpdate,
  onDragStaff,
}: UseAssignmentsChannelProps) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(ASSIGNMENTS_CHANNEL);
    channelRef.current = channel;

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
        onStaffUpdate(updatedStaff);
        return;
      }

      if (
        event.data?.type === "assignments-drag-staff" &&
        event.data?.payload
      ) {
        onDragStaff(event.data.payload as DragStaffPayload);
        return;
      }

      if (event.data?.type !== "assignments-update" || !event.data?.payload) {
        return;
      }

      const updatedProject = event.data.payload as Project;
      onProjectsUpdate(updatedProject);
    };

    channel.addEventListener("message", handleMessage);

    if (shouldShowAssignmentsPanel && selectedProject) {
      sendProjectToFragment(selectedProject);
      sendStaffToFragment(staff);
    }

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [projects, selectedProject, shouldShowAssignmentsPanel, staff, onProjectsUpdate, onStaffUpdate, onDragStaff]);

  return channelRef;
}
