-- AlterTable
ALTER TABLE "brand_settings" ADD COLUMN     "instagram_page_url" TEXT,
ADD COLUMN     "post_image_urls" TEXT[];

-- AlterTable
ALTER TABLE "checkout_sessions" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "payment_groups" ALTER COLUMN "expires_at" SET DEFAULT NOW() + interval '7 day';
