export interface DragStaffPayload {
  staffId: string;
  name: string;
  projectId: string;
}

export const ASSIGNMENTS_CHANNEL = "project-assignments-channel";
export const ASSIGNMENTS_FRAGMENT_ID = "project-assignments";
export const ASSIGNMENTS_FRAGMENT_SRC = "/assignments/";

/** Base path for assignments fragment; with projectId yields iframe src path. */
export function getAssignmentsFragmentSrc(projectId?: string): string {
  return projectId
    ? `${ASSIGNMENTS_FRAGMENT_SRC.replace(/\/$/, "")}/${projectId}`
    : ASSIGNMENTS_FRAGMENT_SRC;
}
