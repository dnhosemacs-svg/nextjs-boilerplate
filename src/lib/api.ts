import type { Task } from "@/types/task";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/validators/task";

function getApiBase() {
  if (typeof window !== "undefined") {
    return "/api/tasks";
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return `${baseUrl}/api/tasks`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "La solicitud falló";

    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Keep fallback message when body is not JSON
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(getApiBase(), {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<Task[]>(response);
}

export async function getTaskById(id: string): Promise<Task> {
  const response = await fetch(`${getApiBase()}/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<Task>(response);
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
