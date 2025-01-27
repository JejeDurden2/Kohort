/*
  Warnings:

  - You are about to drop the column `source` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `ambassadors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone_number]` on the table `ambassadors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ambassadors" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "source";

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- DropEnum
DROP TYPE "OrderSource";

-- CreateIndex
CREATE UNIQUE INDEX "ambassadors_email_key" ON "ambassadors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ambassadors_phone_number_key" ON "ambassadors"("phone_number");
