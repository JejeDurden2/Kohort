-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmailType" ADD VALUE 'CASHBACK_WITHDRAWN';
ALTER TYPE "EmailType" ADD VALUE 'NEW_LEVEL_UNLOCKED';
ALTER TYPE "EmailType" ADD VALUE 'REFUND_BRAND';
ALTER TYPE "EmailType" ADD VALUE 'REFUND_CUSTOMER';
ALTER TYPE "EmailType" ADD VALUE 'PAYOUT_CONFIRMATION';

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "transactional_emails" ADD COLUMN     "isInternal" BOOLEAN NOT NULL DEFAULT false;
