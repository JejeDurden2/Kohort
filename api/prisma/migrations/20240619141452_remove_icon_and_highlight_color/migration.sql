/*
  Warnings:

  - You are about to drop the column `highlight_color` on the `brand_settings` table. All the data in the column will be lost.
  - You are about to drop the column `icon_url` on the `brand_settings` table. All the data in the column will be lost.
  - You are about to drop the column `brand_highlight_color` on the `checkout_settings` table. All the data in the column will be lost.
  - You are about to drop the column `brand_icon_url` on the `checkout_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "brand_settings" DROP COLUMN "highlight_color",
DROP COLUMN "icon_url";

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "checkout_settings" DROP COLUMN "brand_highlight_color",
DROP COLUMN "brand_icon_url";

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
