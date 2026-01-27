export const styles = {
  container: {
    display: "flex",
    gap: "2rem",
    minHeight: "600px",
  } as const,

  projectsList: {
    flex: "0 0 300px",
  } as const,

  projectsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  } as const,

  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "var(--color-btn-primary)",
    color: "var(--color-btn-primary-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
  } as const,

  buttonSuccess: {
    padding: "0.5rem 1rem",
    backgroundColor: "var(--color-btn-success)",
    color: "var(--color-btn-success-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
  } as const,

  buttonSecondary: {
    padding: "0.5rem 1rem",
    backgroundColor: "var(--color-btn-secondary)",
    color: "var(--color-btn-secondary-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
  } as const,

  buttonDanger: {
    padding: "0.5rem 1rem",
    backgroundColor: "var(--color-btn-danger)",
    color: "var(--color-btn-danger-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
  } as const,

  buttonInfo: {
    padding: "0.5rem 1rem",
    backgroundColor: "var(--color-btn-info)",
    color: "var(--color-btn-info-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
  } as const,

  buttonSmall: {
    padding: "0.375rem 0.75rem",
    backgroundColor: "var(--color-btn-success)",
    color: "var(--color-btn-success-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
  } as const,

  buttonSmallSecondary: {
    padding: "0.375rem 0.75rem",
    backgroundColor: "var(--color-btn-secondary)",
    color: "var(--color-btn-secondary-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
  } as const,

  buttonSmallDanger: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "var(--color-btn-danger-subtle-bg)",
    color: "var(--color-btn-danger-subtle-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.75rem",
  } as const,

  buttonClose: {
    padding: "0.4rem 0.6rem",
    borderRadius: "0.375rem",
    border: "1px solid var(--color-btn-close-border)",
    backgroundColor: "var(--color-btn-close-bg)",
    color: "var(--color-text)",
    cursor: "pointer",
  } as const,

  formContainer: {
    padding: "1rem",
    marginBottom: "1rem",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--color-bg-surface-alt)",
  } as const,

  formContainerLarge: {
    padding: "1.5rem",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    backgroundColor: "var(--color-bg-surface-alt)",
  } as const,

  input: {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "0.375rem",
    backgroundColor: "var(--color-bg-surface)",
    color: "var(--color-text)",
  } as const,

  inputLarge: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "0.375rem",
    fontSize: "1.25rem",
    fontWeight: "600",
    backgroundColor: "var(--color-bg-surface)",
    color: "var(--color-text)",
  } as const,

  textarea: {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "0.375rem",
    minHeight: "60px",
    resize: "vertical" as const,
    backgroundColor: "var(--color-bg-surface)",
    color: "var(--color-text)",
  } as const,

  textareaLarge: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "0.375rem",
    minHeight: "100px",
    resize: "vertical" as const,
    backgroundColor: "var(--color-bg-surface)",
    color: "var(--color-text)",
  } as const,

  buttonGroup: {
    display: "flex",
    gap: "0.5rem",
  } as const,

  emptyState: {
    padding: "2rem",
    border: "2px dashed var(--color-border-strong)",
    borderRadius: "0.5rem",
    textAlign: "center" as const,
    backgroundColor: "var(--color-bg-surface-alt)",
  } as const,

  emptyStateText: {
    margin: "0 0 1rem 0",
    color: "var(--color-text-secondary)",
  } as const,

  emptyStateButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "var(--color-btn-primary)",
    color: "var(--color-btn-primary-fg)",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
  } as const,

  projectCard: (isSelected: boolean) => ({
    padding: "1rem",
    border: "1px solid",
    borderColor: isSelected ? "var(--color-link)" : "var(--color-border)",
    borderRadius: "0.5rem",
    cursor: "pointer",
    backgroundColor: isSelected
      ? "var(--color-bg-selected)"
      : "var(--color-bg-surface)",
    color: "var(--color-text)",
    textAlign: "left" as const,
    width: "100%",
  }),

  projectCardTitle: {
    margin: "0 0 0.25rem 0",
    fontSize: "1rem",
  } as const,

  projectCardDescription: {
    margin: 0,
    fontSize: "0.875rem",
    color: "var(--color-text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  } as const,

  projectCardMeta: {
    margin: "0.5rem 0 0 0",
    fontSize: "0.75rem",
    color: "var(--color-text-muted)",
  } as const,

  projectDetail: {
    flex: 1,
    display: "flex",
    gap: "1.5rem",
    alignItems: "flex-start",
  } as const,

  projectDetailContent: {
    flex: 1,
    minWidth: 0,
  } as const,

  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  } as const,

  projectTitle: {
    margin: "0 0 0.5rem 0",
  } as const,

  projectDescription: {
    margin: 0,
    color: "var(--color-text-secondary)",
  } as const,

  projectActions: {
    display: "flex",
    gap: "0.5rem",
  } as const,

  tasksSection: {
    borderTop: "1px solid var(--color-border)",
    paddingTop: "1.5rem",
  } as const,

  tasksHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  } as const,

  tasksList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  } as const,

  taskCard: (isCompleted: boolean, isDragOver: boolean) => ({
    padding: "1rem",
    border: "1px solid",
    borderColor: isDragOver
      ? "var(--color-drag-over)"
      : "var(--color-border)",
    borderRadius: "0.5rem",
    backgroundColor: isCompleted
      ? "var(--color-bg-completed)"
      : "var(--color-bg-surface)",
    color: "var(--color-text)",
    textAlign: "left" as const,
  }),

  taskContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
  } as const,

  taskDetails: {
    flex: 1,
  } as const,

  taskTitle: (isCompleted: boolean) => ({
    margin: "0 0 0.25rem 0",
    fontSize: "1rem",
    textDecoration: isCompleted ? "line-through" : "none",
    color: isCompleted ? "var(--color-text-muted)" : "inherit",
  }),

  taskDescription: {
    margin: 0,
    fontSize: "0.875rem",
    color: "var(--color-text-secondary)",
  } as const,

  assigneesSection: {
    marginTop: "0.5rem",
  } as const,

  assigneesLabel: {
    fontSize: "0.75rem",
    color: "var(--color-text-secondary)",
    marginBottom: "0.25rem",
  } as const,

  assigneesList: {
    display: "flex",
    gap: "0.4rem",
    flexWrap: "wrap" as const,
  } as const,

  assigneeBadge: {
    border: "1px solid var(--color-border-strong)",
    borderRadius: "999px",
    padding: "0.2rem 0.5rem",
    backgroundColor: "var(--color-bg-surface)",
    color: "var(--color-text)",
    fontSize: "0.75rem",
    cursor: "pointer",
  } as const,

  emptyMessage: {
    color: "var(--color-text-muted)",
    fontStyle: "italic" as const,
  } as const,

  centerMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "var(--color-text-muted)",
  } as const,

  assignmentsPanel: {
    width: "360px",
    border: "1px solid var(--color-border)",
    borderRadius: "0.75rem",
    backgroundColor: "var(--color-bg-surface)",
    boxShadow: "var(--shadow-panel)",
    display: "flex",
    flexDirection: "column" as const,
    alignSelf: "stretch",
    minHeight: "600px",
    overflow: "hidden",
  } as const,

  assignmentsPanelHeader: {
    padding: "1rem 1.25rem",
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as const,

  assignmentsPanelContent: {
    flex: 1,
    overflow: "auto" as const,
  } as const,
};
