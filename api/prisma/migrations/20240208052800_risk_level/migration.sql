-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'HIGHEST');

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "payment_intents" ADD COLUMN     "risk_level" "RiskLevel" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "stripe_risk_level" TEXT;
