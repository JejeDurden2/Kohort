-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentIntentStatus" ADD VALUE 'REFUNDED';
ALTER TYPE "PaymentIntentStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "stripe_id" TEXT,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "payment_intent_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refund_id_key" ON "Refund"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_stripe_id_key" ON "Refund"("stripe_id");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "payment_intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
