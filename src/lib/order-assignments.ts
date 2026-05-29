import { db } from "@/lib/db";
import { UserRole } from "@/types/user-role";

export async function replaceOrderWorkerAssignments(
  orderId: string,
  workerIds: string[],
  assignedById: string,
) {
  const uniqueWorkerIds = [...new Set(workerIds)];

  if (uniqueWorkerIds.length > 0) {
    const workers = await db.user.findMany({
      where: { id: { in: uniqueWorkerIds }, role: UserRole.WORKER },
      select: { id: true },
    });
    if (workers.length !== uniqueWorkerIds.length) {
      throw new Error("INVALID_WORKERS");
    }
  }

  await db.$transaction([
    db.orderWorkerAssignment.deleteMany({ where: { orderId } }),
    ...(uniqueWorkerIds.length > 0
      ? [
          db.orderWorkerAssignment.createMany({
            data: uniqueWorkerIds.map((workerId) => ({
              orderId,
              workerId,
              assignedById,
            })),
          }),
        ]
      : []),
  ]);
}

export async function isWorkerAssignedToOrder(
  orderId: string,
  workerId: string,
): Promise<boolean> {
  const assignment = await db.orderWorkerAssignment.findUnique({
    where: { orderId_workerId: { orderId, workerId } },
    select: { id: true },
  });
  return Boolean(assignment);
}
