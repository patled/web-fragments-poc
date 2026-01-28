import type { Project, StaffMember } from "../../data/projectsStorage";
import { ProjectForm } from "./ProjectForm";
import { TaskList } from "./TaskList";
import { styles } from "./styles";

interface ProjectDetailProps {
  project: Project;
  staffById: Record<string, StaffMember>;
  isEditing: boolean;
  editForm: { name: string; description: string };
  dragOverTaskId: string | null;
  assignmentsFragmentAvailable?: boolean;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onDelete: (id: string) => void;
  onOpenAssignments: () => void;
  onAddTask: (projectId: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
  onRemoveAssignee: (taskId: string, staffId: string) => void;
  onTaskDragOver: (event: React.DragEvent<HTMLElement>, taskId: string) => void;
  onTaskDragLeave: (taskId: string) => void;
  onTaskDrop: (event: React.DragEvent<HTMLElement>, task: any) => void;
}

export function ProjectDetail({
  project,
  staffById,
  isEditing,
  editForm,
  dragOverTaskId,
  assignmentsFragmentAvailable = false,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onNameChange,
  onDescriptionChange,
  onDelete,
  onOpenAssignments,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onRemoveAssignee,
  onTaskDragOver,
  onTaskDragLeave,
  onTaskDrop,
}: ProjectDetailProps) {
  if (isEditing) {
    return (
      <ProjectForm
        name={editForm.name}
        description={editForm.description}
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
        isLarge
      />
    );
  }

  return (
    <>
      <div style={styles.projectHeader}>
        <div>
          <h1 style={styles.projectTitle}>{project.name}</h1>
          <p style={styles.projectDescription}>
            {project.description || "No description"}
          </p>
        </div>
        <div style={styles.projectActions}>
          <button onClick={onEdit} style={styles.button}>
            Edit
          </button>
          {assignmentsFragmentAvailable && (
            <button onClick={onOpenAssignments} style={styles.buttonInfo}>
              Assignments
            </button>
          )}
          <button
            onClick={() => onDelete(project.id)}
            style={styles.buttonDanger}
          >
            Delete
          </button>
        </div>
      </div>

      <TaskList
        project={project}
        staffById={staffById}
        dragOverTaskId={dragOverTaskId}
        onAddTask={onAddTask}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onRemoveAssignee={onRemoveAssignee}
        onTaskDragOver={onTaskDragOver}
        onTaskDragLeave={onTaskDragLeave}
        onTaskDrop={onTaskDrop}
      />
    </>
  );
}
