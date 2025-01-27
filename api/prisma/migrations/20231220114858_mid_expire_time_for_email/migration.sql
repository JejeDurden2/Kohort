-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ADD COLUMN     "mid_expire_at" TIMESTAMP(3),
ADD COLUMN     "reminder_email_sent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
