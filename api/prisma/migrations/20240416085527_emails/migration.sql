-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ADD COLUMN     "owner_email" TEXT,
ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "payment_intents" ADD COLUMN     "customer_email" TEXT;
