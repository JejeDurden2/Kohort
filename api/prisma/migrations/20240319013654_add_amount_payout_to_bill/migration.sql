/*
  Warnings:

  - Added the required column `amountPayout` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "amountPayout" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
