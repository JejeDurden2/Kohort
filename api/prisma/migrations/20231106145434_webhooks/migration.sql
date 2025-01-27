-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "events" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhooks_id_key" ON "webhooks"("id");

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
