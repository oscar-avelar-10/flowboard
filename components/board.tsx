"use client";
import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Search,
  CalendarDays,
  GripVertical,
  Columns3,
} from "lucide-react";
import { useStore } from "./store";
import { PageTitle, Badge } from "./views";
import { Button } from "./ui/button";
import { EntityForm } from "./forms";
import { columns, initials, dateLabel, type Task } from "@/lib/data";
function TaskContent({ task }: { task: Task }) {
  const { state, moveTask } = useStore();
  const project = state.projects.find((p) => p.id === task.projectId);
  return (
    <>
      <span className={`task-project ${project?.color ?? "purple"}`}>
        {project?.name ?? "Unassigned"}
      </span>
      <h3>{task.title}</h3>
      <div className="task-badges">
        <Badge value={task.priority} />
        {task.tags
          .split(",")
          .filter(Boolean)
          .map((tag, i) => (
            <span className="tag" key={`${tag}-${i}`}>
              {tag.trim()}
            </span>
          ))}
      </div>
      <div className="task-footer">
        <span className="avatar mini" title={task.assignee}>
          {initials(task.assignee)}
        </span>
        <span className="assignee-name">{task.assignee}</span>
        <span className="task-date">
          <CalendarDays size={12} />
          {dateLabel(task.due).replace(", 2026", "")}
        </span>
      </div>
      <select
        className="task-move"
        aria-label={`Move ${task.title}`}
        value={task.status}
        onChange={(e) => moveTask(task.id, e.target.value as Task["status"])}
      >
        {columns.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </>
  );
}
function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });
  return (
    <article
      ref={setNodeRef}
      className={`task-card ${isDragging ? "dragging" : ""}`}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <button
        className="drag-handle"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${task.title}`}
      >
        <GripVertical size={16} />
      </button>
      <TaskContent task={task} />
    </article>
  );
}
function Column({
  status,
  tasks,
  onAdd,
}: {
  status: Task["status"];
  tasks: Task[];
  onAdd: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "drag-over" : ""}`}
      aria-label={`${status} column`}
    >
      <div className="column-heading">
        <span className={`column-dot column-${columns.indexOf(status)}`} />
        <h2>{status}</h2>
        <span className="column-count">{tasks.length}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Add task to ${status}`}
          onClick={onAdd}
        >
          <Plus size={17} />
        </Button>
      </div>
      <div className="column-tasks">
        {tasks.map((t) => (
          <TaskCard task={t} key={t.id} />
        ))}
        {!tasks.length && (
          <div className="column-empty">
            <Columns3 size={24} />
            <p>A little room for progress.</p>
            <span>Drop a task here or create one.</span>
          </div>
        )}
      </div>
      <button className="add-task-link" onClick={onAdd}>
        <Plus size={15} /> Add task
      </button>
    </section>
  );
}
export function Board() {
  const { state, moveTask } = useStore();
  const [form, setForm] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Task["status"]>("Backlog");
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("all");
  const [active, setActive] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const tasks = state.tasks.filter(
    (t) =>
      (project === "all" || t.projectId === project) &&
      t.title.toLowerCase().includes(query.toLowerCase()),
  );
  function start(e: DragStartEvent) {
    setActive(state.tasks.find((t) => t.id === e.active.id) ?? null);
  }
  function end(e: DragEndEvent) {
    if (e.over && columns.includes(e.over.id as Task["status"]))
      moveTask(String(e.active.id), e.over.id as Task["status"]);
    setActive(null);
  }
  return (
    <>
      <PageTitle
        eyebrow="ONE STEP AT A TIME"
        title="Task board"
        description="Less scattered. More focused. Move good work forward."
      >
        <Button disabled={!state.projects.length} onClick={() => setForm(true)}>
          <Plus size={17} /> New task
        </Button>
      </PageTitle>
      <div className="toolbar standalone">
        <div className="local-search">
          <Search size={17} />
          <input
            aria-label="Search tasks"
            placeholder="Find a task…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter tasks by project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          <option value="all">All projects</option>
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="board-total">{tasks.length} tasks</span>
      </div>
      <p className="board-help">
        Drag a card by its grip, or use its status menu. Keyboard: focus the
        grip, press Space, use arrow keys, then Space to drop.
      </p>
      {!state.projects.length && (
        <p className="report-note">
          Create a project before adding your first task.
        </p>
      )}
      <DndContext
        sensors={sensors}
        onDragStart={start}
        onDragEnd={end}
        onDragCancel={() => setActive(null)}
      >
        <div className="kanban-grid">
          {columns.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onAdd={() => {
                setDefaultStatus(status);
                setForm(true);
              }}
            />
          ))}
        </div>
        <DragOverlay>
          {active && (
            <article className="task-card drag-overlay">
              <TaskContent task={active} />
            </article>
          )}
        </DragOverlay>
      </DndContext>
      {form && (
        <EntityForm
          kind="task"
          defaultStatus={defaultStatus}
          onClose={() => setForm(false)}
        />
      )}
    </>
  );
}
