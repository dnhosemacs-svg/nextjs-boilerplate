import type { Task, TaskStatus } from "@/types/task";

type TaskCreate = {
  title: string;
  description?: string;
  status: TaskStatus;
};

type TaskUpdate = Partial<TaskCreate>;

declare global {
  var __taskflowTasks: Map<string, Task> | undefined;
}

const tasks = globalThis.__taskflowTasks ?? new Map<string, Task>();
globalThis.__taskflowTasks = tasks;

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  return crypto.randomUUID();
}

export function seedTasksIfEmpty() {
  if (tasks.size > 0) return;

  const id = "demo-001";
  const now = nowIso();
  tasks.set(id, {
    id,
    title: "Mesa de comedor (demo)",
    description: "Pedido de ejemplo para probar la API.",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
}

export function listTasks() {
  seedTasksIfEmpty();
  return Array.from(tasks.values()).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function getTaskById(id: string) {
  seedTasksIfEmpty();
  return tasks.get(id) ?? null;
}

export function createTask(input: TaskCreate) {
  seedTasksIfEmpty();
  const id = createId();
  const now = nowIso();

  const task: Task = {
    id,
    title: input.title,
    description: input.description,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  tasks.set(id, task);
  return task;
}

export function updateTask(id: string, patch: TaskUpdate) {
  seedTasksIfEmpty();
  const existing = tasks.get(id);
  if (!existing) return null;

  const updated: Task = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
  };

  tasks.set(id, updated);
  return updated;
}

export function deleteTask(id: string) {
  seedTasksIfEmpty();
  const existing = tasks.get(id);
  if (!existing) return null;

  tasks.delete(id);
  return existing;
}

