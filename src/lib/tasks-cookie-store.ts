import { cookies } from "next/headers";

import type { Task, TaskStatus } from "@/types/task";

const TASKS_COOKIE_KEY = "taskflow_tasks";

type TaskCreate = {
  title: string;
  description?: string;
  status: TaskStatus;
};

type TaskUpdate = Partial<TaskCreate>;

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  return crypto.randomUUID();
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function seedTasks(): Task[] {
  const now = nowIso();
  return [
    {
      id: "demo-001",
      title: "Mesa de comedor (demo)",
      description: "Pedido de ejemplo para probar la API.",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function parseTasks(rawValue?: string): Task[] {
  if (!rawValue) return seedTasks();

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) return seedTasks();

    const validTasks = parsed.filter((item): item is Task => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.title === "string" &&
        (candidate.description === undefined ||
          typeof candidate.description === "string") &&
        (candidate.status === "pending" ||
          candidate.status === "in_progress" ||
          candidate.status === "done") &&
        typeof candidate.createdAt === "string" &&
        typeof candidate.updatedAt === "string"
      );
    });

    return validTasks.length > 0 ? sortTasks(validTasks) : seedTasks();
  } catch {
    return seedTasks();
  }
}

async function readTasksFromCookieStore() {
  const cookieStore = await cookies();
  return parseTasks(cookieStore.get(TASKS_COOKIE_KEY)?.value);
}

async function writeTasksToCookieStore(tasks: Task[]) {
  const cookieStore = await cookies();
  cookieStore.set(TASKS_COOKIE_KEY, JSON.stringify(sortTasks(tasks)), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function listTasksFromCookieStore() {
  return readTasksFromCookieStore();
}

export async function getTaskByIdFromCookieStore(id: string) {
  const tasks = await readTasksFromCookieStore();
  return tasks.find((task) => task.id === id) ?? null;
}

export async function createTaskInCookieStore(input: TaskCreate) {
  const tasks = await readTasksFromCookieStore();
  const now = nowIso();

  const task: Task = {
    id: createId(),
    title: input.title,
    description: input.description,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  const nextTasks = [task, ...tasks];
  await writeTasksToCookieStore(nextTasks);
  return task;
}

export async function updateTaskInCookieStore(id: string, patch: TaskUpdate) {
  const tasks = await readTasksFromCookieStore();
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex < 0) return null;

  const updatedTask: Task = {
    ...tasks[taskIndex],
    ...patch,
    updatedAt: nowIso(),
  };

  const nextTasks = [...tasks];
  nextTasks[taskIndex] = updatedTask;
  await writeTasksToCookieStore(nextTasks);
  return updatedTask;
}

export async function deleteTaskInCookieStore(id: string) {
  const tasks = await readTasksFromCookieStore();
  const existing = tasks.find((task) => task.id === id);
  if (!existing) return null;

  const nextTasks = tasks.filter((task) => task.id !== id);
  await writeTasksToCookieStore(nextTasks);
  return existing;
}
