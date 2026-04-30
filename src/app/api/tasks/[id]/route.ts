import { NextResponse } from "next/server";

import {
  deleteTask,
  getTaskById,
  updateTask,
} from "@/lib/tasks-repository";
import { updateTaskSchema } from "@/lib/validators/task";

type Context = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  const task = await getTaskById(id);
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

  let updated = null;
  try {
    updated = await updateTask(id, parsed.data);
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar el pedido" },
      { status: 500 },
    );
  }

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await Promise.resolve(params);
  let deleted = null;
  try {
    deleted = await deleteTask(id);
  } catch {
    return NextResponse.json(
      { error: "No se pudo eliminar el pedido" },
      { status: 500 },
    );
  }

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deleted, { status: 200 });
}

