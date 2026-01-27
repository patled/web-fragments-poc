import { styles } from "./styles";

interface ProjectFormProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLarge?: boolean;
}

export function ProjectForm({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSave,
  onCancel,
  isLarge = false,
}: ProjectFormProps) {
  return (
    <div style={isLarge ? styles.formContainerLarge : styles.formContainer}>
      <input
        type="text"
        placeholder="Project name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        style={isLarge ? styles.inputLarge : styles.input}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        style={isLarge ? styles.textareaLarge : styles.textarea}
      />
      <div style={styles.buttonGroup}>
        <button
          onClick={onSave}
          style={isLarge ? styles.buttonSuccess : styles.buttonSmall}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={
            isLarge ? styles.buttonSecondary : styles.buttonSmallSecondary
          }
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
