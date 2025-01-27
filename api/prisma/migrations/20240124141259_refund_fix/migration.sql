-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_payment_intent_id_fkey";

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "payment_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
