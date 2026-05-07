import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import {
  deleteTaskInCookieStore,
  getTaskByIdFromCookieStore,
  updateTaskInCookieStore,
} from "@/lib/tasks-cookie-store";
import { updateTaskSchema } from "@/lib/validators/task";

type Context = {
  params: { id: string } | Promise<{ id: string }>;
};

async function isAuthenticatedRequest() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === "1";
}

export async function GET(_request: Request, { params }: Context) {
  if (!(await isAuthenticatedRequest())) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await Promise.resolve(params);
  const task = await getTaskByIdFromCookieStore(id);
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(task, { status: 200 });
}

export async function PUT(request: Request, { params }: Context) {
  if (!(await isAuthenticatedRequest())) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

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

  const updated = await updateTaskInCookieStore(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await isAuthenticatedRequest())) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await Promise.resolve(params);
  const deleted = await deleteTaskInCookieStore(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deleted, { status: 200 });
}

