-- CreateEnum
CREATE TYPE "FromEmailType" AS ENUM ('RESEND_FROM_EMAIL_CASHBACK', 'RESEND_FROM_EMAIL_NOTIFICATIONS', 'RESEND_FROM_EMAIL_SHARE', 'RESEND_FROM_EMAIL_REMINDERS', 'RESEND_FROM_EMAIL_INTERNAL');

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "transactional_emails" ADD COLUMN     "from_email_type" "FromEmailType" NOT NULL DEFAULT 'RESEND_FROM_EMAIL_INTERNAL';
