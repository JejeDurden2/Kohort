-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'CASHBACK_AVAILABLE', 'CASHBACK_PROCESSING', 'CASHBACK_SENT');

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "organization_id" TEXT NOT NULL,
    "amount_total" INTEGER NOT NULL,
    "amount_cashback" INTEGER,
    "application_fee_amount" INTEGER DEFAULT 0,
    "customer_email" TEXT,
    "customer_first_name" TEXT,
    "customer_last_name" TEXT,
    "customer_phone_number" TEXT,
    "payment_group_share_id" TEXT,
    "customer_id" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "locale" "Locale" NOT NULL DEFAULT 'fr_FR',
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "metadata" JSON,
    "payment_group_id" TEXT,
    "client_reference_id" TEXT,
    "token" TEXT,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "orders"("id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_group_id_fkey" FOREIGN KEY ("payment_group_id") REFERENCES "payment_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
