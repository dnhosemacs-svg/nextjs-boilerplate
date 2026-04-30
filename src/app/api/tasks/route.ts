import { NextResponse } from "next/server";

import {
  createTask,
  listTasks,
} from "@/lib/tasks-repository";
import { createTaskSchema } from "@/lib/validators/task";

export async function GET() {
  try {
    const tasks = await listTasks();
    return NextResponse.json(tasks, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los pedidos" },
      { status: 500 },
    );
  }
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

  try {
    const created = await createTask(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear el pedido" },
      { status: 500 },
    );
  }
}

