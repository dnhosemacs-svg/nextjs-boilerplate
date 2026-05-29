import type { Prisma } from "@/generated/prisma/client";

export const orderDetailInclude = {
  materialLines: {
    orderBy: { createdAt: "asc" as const },
  },
  workerAssignments: {
    orderBy: { assignedAt: "asc" as const },
    include: {
      worker: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithDetailInclude = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;
