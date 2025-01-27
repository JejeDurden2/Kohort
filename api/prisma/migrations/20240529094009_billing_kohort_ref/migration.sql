/*
  Warnings:

  - A unique constraint covering the columns `[stripe_customer_id]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BillStatus" ADD VALUE 'NEW';
ALTER TYPE "BillStatus" ADD VALUE 'SENT';
ALTER TYPE "BillStatus" ADD VALUE 'OVERDUE';
COMMIT;

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "due_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "stripe_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "stripe_customer_id" TEXT;

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateIndex
CREATE UNIQUE INDEX "organizations_stripe_customer_id_key" ON "organizations"("stripe_customer_id");
