/*
  Warnings:

  - You are about to drop the column `brand_background_url` on the `checkout_settings` table. All the data in the column will be lost.
  - You are about to drop the column `brand_color` on the `checkout_settings` table. All the data in the column will be lost.
  - You are about to drop the column `brand_logo_url` on the `checkout_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "checkout_settings" DROP COLUMN "brand_background_url",
DROP COLUMN "brand_color",
DROP COLUMN "brand_logo_url";

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
