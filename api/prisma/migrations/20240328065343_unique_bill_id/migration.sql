/*
  Warnings:

  - A unique constraint covering the columns `[bill_id]` on the table `bills` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateIndex
CREATE UNIQUE INDEX "bills_bill_id_key" ON "bills"("bill_id");
