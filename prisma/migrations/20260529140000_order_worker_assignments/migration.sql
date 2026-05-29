-- CreateTable
CREATE TABLE "order_worker_assignments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "order_worker_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_worker_assignments_orderId_idx" ON "order_worker_assignments"("orderId");

-- CreateIndex
CREATE INDEX "order_worker_assignments_workerId_idx" ON "order_worker_assignments"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "order_worker_assignments_orderId_workerId_key" ON "order_worker_assignments"("orderId", "workerId");

-- AddForeignKey
ALTER TABLE "order_worker_assignments" ADD CONSTRAINT "order_worker_assignments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_worker_assignments" ADD CONSTRAINT "order_worker_assignments_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_worker_assignments" ADD CONSTRAINT "order_worker_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
