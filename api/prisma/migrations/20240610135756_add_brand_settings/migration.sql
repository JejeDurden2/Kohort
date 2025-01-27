-- DropIndex
DROP INDEX "checkout_sessions_client_reference_id_key";

-- DropIndex
DROP INDEX "checkout_sessions_payment_client_reference_id_key";

-- DropIndex
DROP INDEX "customers_client_reference_id_key";

-- DropIndex
DROP INDEX "payment_intents_client_reference_id_key";

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateTable
CREATE TABLE "brand_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "icon_url" TEXT,
    "logo_url" TEXT,
    "color" TEXT,
    "highlight_color" TEXT,
    "background_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "brand_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_settings_id_key" ON "brand_settings"("id");

-- AddForeignKey
ALTER TABLE "brand_settings" ADD CONSTRAINT "brand_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
