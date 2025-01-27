-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('PUBLIC', 'SECRET');

-- CreateEnum
CREATE TYPE "PayoutInterval" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "DayOfTheWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('AMOUNT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en_US', 'en_GB', 'fr_FR', 'de_DE');

-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('OPEN', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentIntentStatus" AS ENUM ('CANCELED', 'PROCESSING', 'REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'REQUIRES_ACTION', 'REQUIRES_CAPTURE', 'SUCCEEDED');

-- CreateEnum
CREATE TYPE "PaymentGroupStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELED', 'EXPIRED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "clerk_id" TEXT NOT NULL,
    "stripe_id" TEXT,
    "image_url" TEXT,
    "stripe_dashboard_url" TEXT,
    "payout_interval" "PayoutInterval" NOT NULL DEFAULT 'WEEKLY',
    "payout_anchor_weekly" "DayOfTheWeek" DEFAULT 'MONDAY',
    "payout_anchor_monthly" SMALLINT,
    "kohort_payment_fees" DECIMAL(5,2) NOT NULL DEFAULT 1.75,
    "kohort_acquisition_fees" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "kohort_fixed_payment_fees" INTEGER NOT NULL DEFAULT 25,
    "website_url" TEXT,
    "address_id" TEXT,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "primary_email_address" TEXT NOT NULL,
    "primary_phone_number" TEXT,
    "image_url" TEXT NOT NULL,
    "last_sign_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_invitations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_memberships" (
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("organization_id","user_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "primary_phone_number" TEXT,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "organization_id" TEXT NOT NULL,
    "address_id" TEXT,
    "shipping_address_id" TEXT,
    "metadata" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "hashed_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "organization_id" TEXT NOT NULL,
    "type" "ApiKeyType" NOT NULL DEFAULT 'SECRET',
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "end_date" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" TEXT NOT NULL,
    "share_id" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "organization_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "amount_total" INTEGER NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'OPEN',
    "success_url" TEXT NOT NULL,
    "cancel_url" TEXT,
    "customer_email" TEXT,
    "customer_first_name" TEXT,
    "customer_last_name" TEXT,
    "customer_id" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "locale" "Locale" NOT NULL DEFAULT 'fr_FR',
    "metadata" JSON,
    "payment_group_share_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_items" (
    "id" TEXT NOT NULL,
    "checkout_session_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount_total" INTEGER NOT NULL,
    "image_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" TEXT NOT NULL,
    "stripe_id" TEXT NOT NULL,
    "stripe_client_secret" TEXT,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "amount" INTEGER NOT NULL,
    "amount_captured" INTEGER,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "customer_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "checkout_session_id" TEXT NOT NULL,
    "metadata" JSON,
    "status" "PaymentIntentStatus" NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "payment_group_id" TEXT,
    "application_fee_amount" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "canceled_at" TIMESTAMP(3),

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_groups" (
    "id" TEXT NOT NULL,
    "share_id" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "organization_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" "PaymentGroupStatus" NOT NULL DEFAULT 'OPEN',
    "metadata" JSON,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '7 day',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT DEFAULT 'system',
    "canceled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "payment_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_group_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "payment_group_id" TEXT,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "discount_type" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "max_participants" INTEGER NOT NULL DEFAULT 15,
    "minutes_duration" INTEGER NOT NULL DEFAULT 10080,
    "min_purchase_value" INTEGER NOT NULL DEFAULT 3000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "payment_group_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_levels" (
    "id" TEXT NOT NULL,
    "payment_group_settings_id" TEXT,
    "level" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "participants_to_unlock" INTEGER NOT NULL DEFAULT 2,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL DEFAULT true,
    "cancel_url" TEXT,
    "success_url" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "locale" "Locale" NOT NULL DEFAULT 'fr_FR',
    "brand_icon_url" TEXT,
    "brand_logo_url" TEXT,
    "brand_color" TEXT,
    "brand_highlight_color" TEXT,
    "session_duration" INTEGER DEFAULT 1440,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "checkout_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_id_key" ON "organizations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_clerk_id_key" ON "organizations"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_stripe_id_key" ON "organizations"("stripe_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_address_id_key" ON "organizations"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_id_key" ON "organization_invitations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_key" ON "customers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_address_id_key" ON "customers"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shipping_address_id_key" ON "customers"("shipping_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_organization_id_email_address_key" ON "customers"("organization_id", "email_address");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_id_key" ON "api_keys"("id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hashed_key_key" ON "api_keys"("hashed_key");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_livemode_type_key" ON "api_keys"("key", "livemode", "type");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_id_key" ON "checkout_sessions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_share_id_key" ON "checkout_sessions"("share_id");

-- CreateIndex
CREATE UNIQUE INDEX "line_items_id_key" ON "line_items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_id_key" ON "addresses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_id_key" ON "payment_intents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_stripe_id_key" ON "payment_intents"("stripe_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_stripe_client_secret_key" ON "payment_intents"("stripe_client_secret");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_checkout_session_id_key" ON "payment_intents"("checkout_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_groups_id_key" ON "payment_groups"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_groups_share_id_key" ON "payment_groups"("share_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_group_settings_id_key" ON "payment_group_settings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_group_settings_payment_group_id_key" ON "payment_group_settings"("payment_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "discount_levels_id_key" ON "discount_levels"("id");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_settings_id_key" ON "checkout_settings"("id");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_payment_group_share_id_fkey" FOREIGN KEY ("payment_group_share_id") REFERENCES "payment_groups"("share_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_items" ADD CONSTRAINT "line_items_checkout_session_id_fkey" FOREIGN KEY ("checkout_session_id") REFERENCES "checkout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_checkout_session_id_fkey" FOREIGN KEY ("checkout_session_id") REFERENCES "checkout_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_payment_group_id_fkey" FOREIGN KEY ("payment_group_id") REFERENCES "payment_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_groups" ADD CONSTRAINT "payment_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_groups" ADD CONSTRAINT "payment_groups_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_group_settings" ADD CONSTRAINT "payment_group_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_group_settings" ADD CONSTRAINT "payment_group_settings_payment_group_id_fkey" FOREIGN KEY ("payment_group_id") REFERENCES "payment_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_levels" ADD CONSTRAINT "discount_levels_payment_group_settings_id_fkey" FOREIGN KEY ("payment_group_settings_id") REFERENCES "payment_group_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_settings" ADD CONSTRAINT "checkout_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

