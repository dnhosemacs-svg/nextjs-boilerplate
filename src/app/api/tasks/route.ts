import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  createTaskInCookieStore,
  listTasksFromCookieStore,
} from "@/lib/tasks-cookie-store";
import { createTaskSchema } from "@/lib/validators/task";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tasks = await listTasksFromCookieStore();
  return NextResponse.json(tasks, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

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

