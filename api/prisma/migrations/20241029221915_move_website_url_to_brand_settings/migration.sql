/*
  Warnings:

  - You are about to drop the column `website_url` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "brand_settings" ADD COLUMN     "website_url" TEXT;

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
