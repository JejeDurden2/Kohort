/*
  Warnings:

  - The values [en_GB,de_DE] on the enum `Locale` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Locale_new" AS ENUM ('en_US', 'fr_FR');
ALTER TABLE "users" ALTER COLUMN "locale" DROP DEFAULT;
ALTER TABLE "checkout_sessions" ALTER COLUMN "locale" DROP DEFAULT;
ALTER TABLE "checkout_settings" ALTER COLUMN "locale" DROP DEFAULT;
ALTER TABLE "customers" ALTER COLUMN "locale" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "locale" TYPE "Locale_new" USING ("locale"::text::"Locale_new");
ALTER TABLE "customers" ALTER COLUMN "locale" TYPE "Locale_new" USING ("locale"::text::"Locale_new");
ALTER TABLE "checkout_sessions" ALTER COLUMN "locale" TYPE "Locale_new" USING ("locale"::text::"Locale_new");
ALTER TABLE "checkout_settings" ALTER COLUMN "locale" TYPE "Locale_new" USING ("locale"::text::"Locale_new");
ALTER TYPE "Locale" RENAME TO "Locale_old";
ALTER TYPE "Locale_new" RENAME TO "Locale";
DROP TYPE "Locale_old";
ALTER TABLE "users" ALTER COLUMN "locale" SET DEFAULT 'fr_FR';
ALTER TABLE "checkout_sessions" ALTER COLUMN "locale" SET DEFAULT 'fr_FR';
ALTER TABLE "checkout_settings" ALTER COLUMN "locale" SET DEFAULT 'fr_FR';
ALTER TABLE "customers" ALTER COLUMN "locale" SET DEFAULT 'fr_FR';
COMMIT;

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
