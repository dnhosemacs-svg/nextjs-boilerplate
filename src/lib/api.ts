import type { Task } from "@/types/task";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/validators/task";
import { parseResponse } from "@/lib/http/parse-response";

function getApiBase() {
  if (typeof window !== "undefined") {
    return "/api/tasks";
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${baseUrl}/api/tasks`;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(getApiBase(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<Task>(response);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const response = await fetch(`${getApiBase()}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<Task> {
  const response = await fetch(`${getApiBase()}/${id}`, {
    method: "DELETE",
  });

  return parseResponse<Task>(response);
}
