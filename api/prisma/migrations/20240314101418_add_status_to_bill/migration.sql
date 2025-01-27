-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PAID');

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "status" "BillStatus" NOT NULL DEFAULT 'PAID';

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
