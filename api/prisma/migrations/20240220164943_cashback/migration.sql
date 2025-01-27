-- AlterEnum
ALTER TYPE "PaymentIntentStatus" ADD VALUE 'CASHBACK_SENT';

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "payment_intents" ADD COLUMN     "amount_cashback" INTEGER;
