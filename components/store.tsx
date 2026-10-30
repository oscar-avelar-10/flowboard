"use client";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  seed,
  stateSchema,
  type State,
  type Client,
  type Project,
  type Task,
} from "@/lib/data";
const KEY = "flowboard.workspace.v1";
let current: State = seed;
let loaded = false;
let storageWarning = "";
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function hydrate() {
  if (loaded) return;
  loaded = true;
  try {
    const value = localStorage.getItem(KEY);
    if (value) {
      const result = stateSchema.safeParse(JSON.parse(value));
      if (result.success) current = result.data;
      else
        storageWarning =
          "Saved data could not be read. Demo data is shown; reset the workspace to start fresh.";
    }
  } catch {
    storageWarning =
      "Browser storage is unavailable. Changes will last only for this session.";
  }
}
function subscribe(fn: () => void) {
  hydrate();
  listeners.add(fn);
  const sync = (e: StorageEvent) => {
    if (e.key === KEY) {
      try {
        current = e.newValue ? stateSchema.parse(JSON.parse(e.newValue)) : seed;
        emit();
      } catch {
        storageWarning =
          "Another tab saved unreadable data. Your current workspace has been preserved.";
        emit();
      }
    }
  };
  window.addEventListener("storage", sync);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", sync);
  };
}
function commit(next: State) {
  current = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    storageWarning = "";
  } catch {
    storageWarning =
      "Changes could not be saved to this browser. Keep this tab open or free browser storage.";
  }
  emit();
}
type Store = {
  state: State;
  ready: boolean;
  warning: string;
  notice: string;
  notify: (s: string) => void;
  addClient: (x: Omit<Client, "id">) => void;
  deleteClient: (id: string) => void;
  saveProject: (x: Omit<Project, "id" | "color">, id?: string) => void;
  addTask: (x: Omit<Task, "id">) => void;
  moveTask: (id: string, status: Task["status"]) => void;
  reset: () => void;
};
const Context = createContext<Store | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    () => current,
    () => seed,
  );
  const ready = useSyncExternalStore(
    subscribe,
    () => loaded,
    () => false,
  );
  const warning = useSyncExternalStore(
    subscribe,
    () => storageWarning,
    () => "",
  );
  const [notice, setNotice] = useState("");
  const notify = useCallback((s: string) => setNotice(s), []);
  function change(next: State, message: string) {
    next.activity = [
      {
        id: crypto.randomUUID(),
        text: message,
        time: new Date().toISOString(),
      },
      ...next.activity,
    ].slice(0, 30);
    commit(next);
    notify(message);
  }
  return (
    <Context.Provider
      value={{
        state,
        ready,
        warning,
        notice,
        notify,
        addClient(x) {
          change(
            {
              ...current,
              clients: [...current.clients, { ...x, id: crypto.randomUUID() }],
            },
            `${x.company} added to clients`,
          );
        },
        deleteClient(id) {
          if (current.projects.some((p) => p.clientId === id)) {
            notify(
              "This client has projects. Reassign those projects before deleting the client.",
            );
            return;
          }
          const name = current.clients.find((c) => c.id === id)?.company;
          change(
            { ...current, clients: current.clients.filter((c) => c.id !== id) },
            `${name} removed from clients`,
          );
        },
        saveProject(x, id) {
          const data = x.status === "Completed" ? { ...x, progress: 100 } : x;
          change(
            {
              ...current,
              projects: id
                ? current.projects.map((p) =>
                    p.id === id ? { ...p, ...data } : p,
                  )
                : [
                    ...current.projects,
                    {
                      ...data,
                      id: crypto.randomUUID(),
                      color: ["purple", "blue", "green", "amber"][
                        current.projects.length % 4
                      ],
                    },
                  ],
            },
            `${x.name} ${id ? "updated" : "created"}`,
          );
        },
        addTask(x) {
          change(
            {
              ...current,
              tasks: [...current.tasks, { ...x, id: crypto.randomUUID() }],
            },
            `Task created: ${x.title}`,
          );
        },
        moveTask(id, status) {
          const task = current.tasks.find((t) => t.id === id);
          if (!task || task.status === status) return;
          change(
            {
              ...current,
              tasks: current.tasks.map((t) =>
                t.id === id ? { ...t, status } : t,
              ),
            },
            `${task.title} moved to ${status}`,
          );
        },
        reset() {
          commit(structuredClone(seed));
          notify("Demo workspace restored");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("Missing workspace provider");
  return context;
}
