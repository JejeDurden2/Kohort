/*
  Warnings:

  - You are about to drop the column `address_id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_address_id` on the `customers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_address_id_fkey";

-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_shipping_address_id_fkey";

-- DropIndex
DROP INDEX "customers_address_id_key";

-- DropIndex
DROP INDEX "customers_shipping_address_id_key";

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "address_id",
DROP COLUMN "shipping_address_id";

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
