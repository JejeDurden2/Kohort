/*
  Warnings:

  - You are about to drop the column `likes` on the `payment_intents` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LineItemType" AS ENUM ('PRODUCT', 'GIFT_CARD', 'DISCOUNT', 'SHIPPING', 'STORE_CREDIT');

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "locale" "Locale" NOT NULL DEFAULT 'fr_FR';

-- AlterTable
ALTER TABLE "line_items" ADD COLUMN     "type" "LineItemType" NOT NULL DEFAULT 'PRODUCT';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "payment_intents" DROP COLUMN "likes";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locale" "Locale" NOT NULL DEFAULT 'fr_FR';
