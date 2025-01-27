/*
  Warnings:

  - You are about to drop the `Refund` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_payment_intent_id_fkey";

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- DropTable
DROP TABLE "Refund";

-- CreateTable
CREATE TABLE "refunds" (
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

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refunds_id_key" ON "refunds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_stripe_id_key" ON "refunds"("stripe_id");

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "payment_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
