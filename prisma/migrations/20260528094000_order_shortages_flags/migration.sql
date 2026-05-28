-- Add shortage tracking fields to orders
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "hasShortages" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "shortages" JSONB;
