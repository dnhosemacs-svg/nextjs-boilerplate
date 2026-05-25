import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import {
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import {
  createTaskInCookieStore,
  listTasksFromCookieStore,
} from "@/lib/tasks-cookie-store";
import { createTaskSchema } from "@/lib/validators/task";

export async function GET() {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const tasks = await listTasksFromCookieStore();
  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = createTaskSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const created = await createTaskInCookieStore(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
