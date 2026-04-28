import { NextResponse } from "next/server";

import { deleteTask, getTaskById, updateTask } from "@/lib/tasks-store";
import { updateTaskSchema } from "@/lib/validators/task";

type Context = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: Context) {
  const task = getTaskById(params.id);
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(task, { status: 200 });
}

export async function PUT(request: Request, { params }: Context) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = updateTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const updated = updateTask(params.id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Context) {
  const deleted = deleteTask(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deleted, { status: 200 });
}

