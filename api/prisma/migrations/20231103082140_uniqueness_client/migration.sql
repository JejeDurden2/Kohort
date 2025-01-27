/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,email_address,livemode]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "customers_organization_id_email_address_key";

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateIndex
CREATE UNIQUE INDEX "customers_organization_id_email_address_livemode_key" ON "customers"("organization_id", "email_address", "livemode");
