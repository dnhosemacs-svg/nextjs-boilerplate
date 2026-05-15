import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
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

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = createTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const created = await createTaskInCookieStore(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
