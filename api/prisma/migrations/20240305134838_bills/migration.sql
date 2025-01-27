-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "bill_id" TEXT NOT NULL,
    "stripe_id" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bills_id_key" ON "bills"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bills_stripe_id_key" ON "bills"("stripe_id");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
