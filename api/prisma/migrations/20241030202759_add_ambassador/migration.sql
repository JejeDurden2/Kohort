-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('AMBASSADOR', 'DEFAULT');

-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'ONBOARDING_AMBASSADOR';

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "ambassador_id" TEXT,
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateTable
CREATE TABLE "ambassadors" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT NOT NULL,
    "referral_code" TEXT,
    "metadata" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "ambassadors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AmbassadorToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ambassadors_id_key" ON "ambassadors"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ambassadors_referral_code_key" ON "ambassadors"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "_AmbassadorToOrganization_AB_unique" ON "_AmbassadorToOrganization"("A", "B");

-- CreateIndex
CREATE INDEX "_AmbassadorToOrganization_B_index" ON "_AmbassadorToOrganization"("B");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ambassador_id_fkey" FOREIGN KEY ("ambassador_id") REFERENCES "ambassadors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmbassadorToOrganization" ADD CONSTRAINT "_AmbassadorToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "ambassadors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmbassadorToOrganization" ADD CONSTRAINT "_AmbassadorToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
