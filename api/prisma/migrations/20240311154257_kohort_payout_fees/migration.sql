-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "kohort_payout_fees" DECIMAL(5,2) NOT NULL DEFAULT 0.25,
ALTER COLUMN "kohort_payment_fees" SET DEFAULT 1.9;

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
