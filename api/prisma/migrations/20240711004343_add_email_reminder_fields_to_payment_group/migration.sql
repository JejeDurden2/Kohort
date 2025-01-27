/*
  Warnings:

  - The `reminder_email_sent` column on the `payment_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReminderEmailSentStatus" AS ENUM ('NOT_SENT', 'MIDWAY_SENT', 'DAY3_SENT', 'DAY2_BEFORE_END_SENT');

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ADD COLUMN     "j_minus_2_expire_at" TIMESTAMP(3),
ADD COLUMN     "j_plus_3_start_at" TIMESTAMP(3),
ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day',
DROP COLUMN "reminder_email_sent",
ADD COLUMN     "reminder_email_sent" "ReminderEmailSentStatus" NOT NULL DEFAULT 'NOT_SENT';
