-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('NEW_GROUP', 'JOIN_GROUP', 'GROUP_REMINDER', 'CASHBACK_AVAILABLE', 'CASHBACK_SENT', 'GROUP_EXPIRED');

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateTable
CREATE TABLE "transactional_emails" (
    "id" TEXT NOT NULL,
    "type" "EmailType" NOT NULL DEFAULT 'NEW_GROUP',
    "subject" TEXT NOT NULL,
    "preheader_text" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "locale" "Locale" NOT NULL DEFAULT 'fr_FR',
    "organization_id" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSON NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "transactional_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactional_emails_id_key" ON "transactional_emails"("id");

-- CreateIndex
CREATE UNIQUE INDEX "transactional_emails_organization_id_type_livemode_locale_key" ON "transactional_emails"("organization_id", "type", "livemode", "locale");

-- AddForeignKey
ALTER TABLE "transactional_emails" ADD CONSTRAINT "transactional_emails_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
