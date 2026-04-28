import { NextResponse } from "next/server";

import { createTask, listTasks } from "@/lib/tasks-store";
import { createTaskSchema } from "@/lib/validators/task";

export async function GET() {
  const tasks = listTasks();
  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: Request) {
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

  const created = createTask(parsed.data);
  return NextResponse.json(created, { status: 201 });
}

