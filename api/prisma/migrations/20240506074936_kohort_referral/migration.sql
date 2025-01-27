/*
  Warnings:

  - A unique constraint covering the columns `[client_reference_id]` on the table `checkout_sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payment_client_reference_id]` on the table `checkout_sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_reference_id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_reference_id]` on the table `payment_intents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('KOHORT_PAY', 'KOHORT_REFERRAL');

-- AlterTable
ALTER TABLE "checkout_sessions" ADD COLUMN     "client_reference_id" TEXT,
ADD COLUMN     "payment_client_reference_id" TEXT,
ALTER COLUMN "success_url" DROP NOT NULL,
ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "client_reference_id" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "product_type" "ProductType" NOT NULL DEFAULT 'KOHORT_PAY';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "payment_intents" ADD COLUMN     "client_reference_id" TEXT,
ALTER COLUMN "stripe_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_client_reference_id_key" ON "checkout_sessions"("client_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_payment_client_reference_id_key" ON "checkout_sessions"("payment_client_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_client_reference_id_key" ON "customers"("client_reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_client_reference_id_key" ON "payment_intents"("client_reference_id");
