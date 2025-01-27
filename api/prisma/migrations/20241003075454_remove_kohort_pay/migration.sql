/*
  Warnings:

  - The values [REFUND_BRAND,REFUND_CUSTOMER] on the enum `EmailType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PROCESSING,REQUIRES_PAYMENT_METHOD,REQUIRES_CONFIRMATION,REQUIRES_ACTION,REQUIRES_CAPTURE,REFUNDED,PARTIALLY_REFUNDED] on the enum `PaymentIntentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `kohort_fixed_payment_fees` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `kohort_payment_fees` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `kohort_payout_fees` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `payout_anchor_monthly` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `payout_anchor_weekly` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `payout_interval` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `product_type` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_dashboard_url` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_id` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_client_secret` on the `payment_intents` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_id` on the `payment_intents` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_risk_level` on the `payment_intents` table. All the data in the column will be lost.
  - You are about to drop the `checkout_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refunds` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmailType_new" AS ENUM ('NEW_GROUP', 'JOIN_GROUP', 'GROUP_REMINDER', 'CASHBACK_AVAILABLE', 'CASHBACK_SENT', 'CASHBACK_WITHDRAWN', 'NEW_LEVEL_UNLOCKED', 'GROUP_EXPIRED', 'PAYOUT_CONFIRMATION');
ALTER TABLE "transactional_emails" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "transactional_emails" ALTER COLUMN "type" TYPE "EmailType_new" USING ("type"::text::"EmailType_new");
ALTER TYPE "EmailType" RENAME TO "EmailType_old";
ALTER TYPE "EmailType_new" RENAME TO "EmailType";
DROP TYPE "EmailType_old";
ALTER TABLE "transactional_emails" ALTER COLUMN "type" SET DEFAULT 'NEW_GROUP';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentIntentStatus_new" AS ENUM ('CANCELED', 'SUCCEEDED', 'CASHBACK_AVAILABLE', 'CASHBACK_PROCESSING', 'CASHBACK_SENT');
ALTER TABLE "payment_intents" ALTER COLUMN "status" TYPE "PaymentIntentStatus_new" USING ("status"::text::"PaymentIntentStatus_new");
ALTER TYPE "PaymentIntentStatus" RENAME TO "PaymentIntentStatus_old";
ALTER TYPE "PaymentIntentStatus_new" RENAME TO "PaymentIntentStatus";
DROP TYPE "PaymentIntentStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "checkout_settings" DROP CONSTRAINT "checkout_settings_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_payment_intent_id_fkey";

-- DropIndex
DROP INDEX "organizations_stripe_id_key";

-- DropIndex
DROP INDEX "payment_intents_stripe_client_secret_key";

-- DropIndex
DROP INDEX "payment_intents_stripe_id_key";

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "kohort_fixed_payment_fees",
DROP COLUMN "kohort_payment_fees",
DROP COLUMN "kohort_payout_fees",
DROP COLUMN "payout_anchor_monthly",
DROP COLUMN "payout_anchor_weekly",
DROP COLUMN "payout_interval",
DROP COLUMN "product_type",
DROP COLUMN "stripe_dashboard_url",
DROP COLUMN "stripe_id";

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "payment_intents" DROP COLUMN "stripe_client_secret",
DROP COLUMN "stripe_id",
DROP COLUMN "stripe_risk_level";

-- DropTable
DROP TABLE "checkout_settings";

-- DropTable
DROP TABLE "refunds";

-- DropEnum
DROP TYPE "PayoutInterval";

-- DropEnum
DROP TYPE "ProductType";

-- DropEnum
DROP TYPE "RefundStatus";
