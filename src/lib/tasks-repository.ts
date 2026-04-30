import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validators/task";
import { mapTaskDocumentToTask, TaskModel } from "@/models/task";
import type { Task } from "@/types/task";

export async function listTasks(): Promise<Task[]> {
  await connectToDatabase();
  const tasks = await TaskModel.find().sort({ createdAt: -1 }).lean();
  return tasks.map((task) => mapTaskDocumentToTask(task));
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await connectToDatabase();
  const task = await TaskModel.findById(id).lean();
  return task ? mapTaskDocumentToTask(task) : null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  await connectToDatabase();
  const created = await TaskModel.create(input);
  return mapTaskDocumentToTask(created.toObject());
}

export async function updateTask(
  id: string,
  patch: UpdateTaskInput,
): Promise<Task | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await connectToDatabase();
  const updated = await TaskModel.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  }).lean();

  return updated ? mapTaskDocumentToTask(updated) : null;
}

export async function deleteTask(id: string): Promise<Task | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await connectToDatabase();
  const deleted = await TaskModel.findByIdAndDelete(id).lean();
  return deleted ? mapTaskDocumentToTask(deleted) : null;
}
