"use client";
import {
  useForm,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  clientSchema,
  projectSchema,
  taskSchema,
  columns,
  type Project,
  type Task,
} from "@/lib/data";
import { useStore } from "./store";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
type Values =
  | z.infer<typeof clientSchema>
  | z.infer<typeof projectSchema>
  | z.infer<typeof taskSchema>;
function Field({
  name,
  label,
  type = "text",
  options,
  register,
  errors,
}: {
  name: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
  register: UseFormRegister<Values>;
  errors: FieldErrors<Values>;
}) {
  const error = (errors as Record<string, { message?: string }>)[name]?.message;
  const id = `field-${name}`;
  const attrs = {
    id,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    ...register(name as keyof Values, { valueAsNumber: type === "number" }),
  };
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {options ? (
        <select {...attrs}>
          {options.map((o) => (
            <option value={o.value} key={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea {...attrs} rows={3} />
      ) : (
        <input
          {...attrs}
          type={type}
          step={type === "number" ? "any" : undefined}
        />
      )}{" "}
      {error && (
        <small id={`${id}-error`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
const opts = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));
export function EntityForm({
  kind,
  onClose,
  project,
  defaultStatus,
}: {
  kind: "client" | "project" | "task";
  onClose: () => void;
  project?: Project;
  defaultStatus?: Task["status"];
}) {
  const { state, addClient, saveProject, addTask } = useStore();
  const schema =
    kind === "client"
      ? clientSchema
      : kind === "project"
        ? projectSchema
        : taskSchema;
  const today = new Date().toISOString().slice(0, 10);
  const defaults: Values =
    kind === "client"
      ? { name: "", company: "", email: "", status: "Lead" }
      : kind === "project"
        ? (project ?? {
            name: "",
            description: "",
            clientId: state.clients[0]?.id ?? "",
            budget: 0,
            priority: "Medium",
            status: "Planning",
            progress: 0,
            due: today,
          })
        : {
            title: "",
            projectId: state.projects[0]?.id ?? "",
            priority: "Medium",
            status: defaultStatus ?? "Backlog",
            assignee: "Alex Morgan",
            due: today,
            tags: "",
          };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const field = (
    name: string,
    label: string,
    type = "text",
    options?: { value: string; label: string }[],
  ) => (
    <Field
      name={name}
      label={label}
      type={type}
      options={options}
      register={register}
      errors={errors}
    />
  );
  function submit(values: Values) {
    if (kind === "client") addClient(clientSchema.parse(values));
    else if (kind === "project")
      saveProject(projectSchema.parse(values), project?.id);
    else addTask(taskSchema.parse(values));
    onClose();
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`${project ? "Edit" : "New"} ${kind}`}
      description="Personal portfolio demo · Use fictional details only."
    >
      <form onSubmit={handleSubmit(submit)} noValidate className="entity-form">
        {kind === "client" ? (
          <>
            {field("name", "Contact name")}
            {field("company", "Company")}
            {field("email", "Email address", "email")}
            {field(
              "status",
              "Status",
              "text",
              opts(["Active", "Lead", "Inactive"]),
            )}
          </>
        ) : kind === "project" ? (
          <>
            {field("name", "Project name")}
            {field("description", "Description", "textarea")}
            {field("clientId", "Client", "text", [
              { value: "", label: "Select a client" },
              ...state.clients.map((c) => ({ value: c.id, label: c.company })),
            ])}
            <div className="form-grid">
              {field("budget", "Budget (USD)", "number")}
              {field("progress", "Progress (%)", "number")}
              {field(
                "status",
                "Status",
                "text",
                opts(["Planning", "In progress", "Review", "Completed"]),
              )}
              {field(
                "priority",
                "Priority",
                "text",
                opts(["Low", "Medium", "High"]),
              )}
            </div>
            {field("due", "Due date", "date")}
          </>
        ) : (
          <>
            {field("title", "Task title")}
            {field("projectId", "Project", "text", [
              { value: "", label: "Select a project" },
              ...state.projects.map((p) => ({ value: p.id, label: p.name })),
            ])}
            <div className="form-grid">
              {field("status", "Column", "text", opts(columns))}
              {field(
                "priority",
                "Priority",
                "text",
                opts(["Low", "Medium", "High"]),
              )}
            </div>
            {field("assignee", "Assignee")}
            {field("tags", "Tags (comma separated)")}
            {field("due", "Due date", "date")}
          </>
        )}
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {project ? "Save changes" : `Create ${kind}`}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
