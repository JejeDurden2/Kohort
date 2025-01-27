-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "payment_intents" ADD COLUMN     "ambassador_id" TEXT;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "ambassadors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
