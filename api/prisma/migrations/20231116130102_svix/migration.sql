/*
  Warnings:

  - You are about to drop the column `secret` on the `webhooks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[svix_application_id]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[svix_endpoint_id]` on the table `webhooks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `svix_endpoint_id` to the `webhooks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "svix_application_id" TEXT;

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- AlterTable
ALTER TABLE "webhooks" DROP COLUMN "secret",
ADD COLUMN     "svix_endpoint_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_svix_application_id_key" ON "organizations"("svix_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "webhooks_svix_endpoint_id_key" ON "webhooks"("svix_endpoint_id");
