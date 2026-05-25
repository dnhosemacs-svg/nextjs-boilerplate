import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import {
  type IdRouteContext,
  parseJsonBody,
  resolveRouteParams,
  validationErrorResponse,
} from "@/lib/api-route-utils";
import {
  deleteTaskInCookieStore,
  getTaskByIdFromCookieStore,
  updateTaskInCookieStore,
} from "@/lib/tasks-cookie-store";
import { updateTaskSchema } from "@/lib/validators/task";

export async function GET(_request: Request, { params }: IdRouteContext) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);
  const task = await getTaskByIdFromCookieStore(id);
  if (!task) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(task, { status: 200 });
}

export async function PUT(request: Request, { params }: IdRouteContext) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);
  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateTaskSchema.safeParse(body.data);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const updated = await updateTaskInCookieStore(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_request: Request, { params }: IdRouteContext) {
  const auth = await requireApiSession();
  if (!auth.ok) return auth.response;

  const { id } = await resolveRouteParams(params);
  const deleted = await deleteTaskInCookieStore(id);
  if (!deleted) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(deleted, { status: 200 });
}
