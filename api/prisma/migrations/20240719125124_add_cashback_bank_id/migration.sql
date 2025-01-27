/*
  Warnings:

  - A unique constraint covering the columns `[cashback_bank_id]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "cashback_bank_id" TEXT;

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateIndex
CREATE UNIQUE INDEX "organizations_cashback_bank_id_key" ON "organizations"("cashback_bank_id");
