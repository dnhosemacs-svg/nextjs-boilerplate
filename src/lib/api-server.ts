import { headers } from "next/headers";

import type { Task } from "@/types/task";

async function getServerBaseUrl() {
  const incomingHeaders = await headers();
  const host =
    incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host");
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("No se pudo resolver el host de la petición actual");
  }

  return `${protocol}://${host}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed";

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

export async function getTasksServer(): Promise<Task[]> {
  const baseUrl = await getServerBaseUrl();
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<Task[]>(response);
}

export async function getTaskByIdServer(id: string): Promise<Task> {
  const baseUrl = await getServerBaseUrl();
  const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<Task>(response);
}
