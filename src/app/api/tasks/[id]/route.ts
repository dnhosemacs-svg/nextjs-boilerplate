import { NextResponse } from "next/server";

import { deleteTask, getTaskById, updateTask } from "@/lib/tasks-store";
import { updateTaskSchema } from "@/lib/validators/task";

type Context = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  const task = getTaskById(id);
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(task, { status: 200 });
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
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

  const updated = updateTask(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  const deleted = deleteTask(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deleted, { status: 200 });
}

