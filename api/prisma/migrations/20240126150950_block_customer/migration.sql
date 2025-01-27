-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "blocked_at" TIMESTAMP(3),
ADD COLUMN     "blocked_by" TEXT,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
