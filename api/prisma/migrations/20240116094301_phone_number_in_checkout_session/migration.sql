-- AlterTable
ALTER TABLE "checkout_sessions" ADD COLUMN     "customer_phone_number" TEXT,
ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
