-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "company_name" TEXT,
ADD COLUMN     "registration_number" TEXT,
ADD COLUMN     "vat_number" TEXT;

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
