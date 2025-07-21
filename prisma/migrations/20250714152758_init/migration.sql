-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "customers" (
    "id" VARCHAR(36) NOT NULL,
    "pseudonym" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" VARCHAR(36) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0.00,
    "paymentMethodId" VARCHAR(64),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "shipmentStatus" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "shipmentAddress" VARCHAR(256),
    "customerId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_watches" (
    "id" VARCHAR(36) NOT NULL,
    "bookingId" VARCHAR(36) NOT NULL,
    "watchId" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_watches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watches" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "referenceCode" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "primaryPhotoUrl" VARCHAR(500) NOT NULL,
    "detail" JSONB,
    "brandId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "watches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "logoUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colors" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "hex" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_colors" (
    "id" VARCHAR(36) NOT NULL,
    "watchId" VARCHAR(36) NOT NULL,
    "colorId" VARCHAR(36) NOT NULL,

    CONSTRAINT "watch_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_categories" (
    "id" VARCHAR(36) NOT NULL,
    "watchId" VARCHAR(36) NOT NULL,
    "categoryId" VARCHAR(36) NOT NULL,

    CONSTRAINT "watch_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_concepts" (
    "id" VARCHAR(36) NOT NULL,
    "watchId" VARCHAR(36) NOT NULL,
    "conceptId" VARCHAR(36) NOT NULL,

    CONSTRAINT "watch_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_materials" (
    "id" VARCHAR(36) NOT NULL,
    "watchId" VARCHAR(36) NOT NULL,
    "materialId" VARCHAR(36) NOT NULL,

    CONSTRAINT "watch_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_specification_headings" (
    "id" VARCHAR(36) NOT NULL,
    "watchId" VARCHAR(36) NOT NULL,
    "heading" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_specification_headings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_specification_points" (
    "id" VARCHAR(36) NOT NULL,
    "headingId" VARCHAR(36) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "value" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_specification_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_photos" (
    "id" VARCHAR(36) NOT NULL,
    "watchId" VARCHAR(36) NOT NULL,
    "photoUrl" VARCHAR(500) NOT NULL,
    "altText" VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_pseudonym_key" ON "customers"("pseudonym");

-- CreateIndex
CREATE INDEX "customers_pseudonym_idx" ON "customers"("pseudonym");

-- CreateIndex
CREATE INDEX "bookings_customerId_idx" ON "bookings"("customerId");

-- CreateIndex
CREATE INDEX "bookings_paymentStatus_idx" ON "bookings"("paymentStatus");

-- CreateIndex
CREATE INDEX "bookings_shipmentStatus_idx" ON "bookings"("shipmentStatus");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_createdAt_idx" ON "bookings"("createdAt");

-- CreateIndex
CREATE INDEX "booking_watches_bookingId_idx" ON "booking_watches"("bookingId");

-- CreateIndex
CREATE INDEX "booking_watches_watchId_idx" ON "booking_watches"("watchId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_watches_bookingId_watchId_key" ON "booking_watches"("bookingId", "watchId");

-- CreateIndex
CREATE UNIQUE INDEX "watches_name_key" ON "watches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "watches_referenceCode_key" ON "watches"("referenceCode");

-- CreateIndex
CREATE INDEX "watches_name_idx" ON "watches"("name");

-- CreateIndex
CREATE INDEX "watches_referenceCode_idx" ON "watches"("referenceCode");

-- CreateIndex
CREATE INDEX "watches_brandId_idx" ON "watches"("brandId");

-- CreateIndex
CREATE INDEX "watches_isAvailable_stockQuantity_idx" ON "watches"("isAvailable", "stockQuantity");

-- CreateIndex
CREATE INDEX "watches_price_idx" ON "watches"("price");

-- CreateIndex
CREATE INDEX "watches_createdAt_idx" ON "watches"("createdAt");

-- CreateIndex
CREATE INDEX "watches_deletedAt_idx" ON "watches"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE INDEX "brands_name_idx" ON "brands"("name");

-- CreateIndex
CREATE INDEX "brands_deletedAt_idx" ON "brands"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "colors_name_key" ON "colors"("name");

-- CreateIndex
CREATE INDEX "colors_name_idx" ON "colors"("name");

-- CreateIndex
CREATE INDEX "watch_colors_watchId_idx" ON "watch_colors"("watchId");

-- CreateIndex
CREATE INDEX "watch_colors_colorId_idx" ON "watch_colors"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "watch_colors_watchId_colorId_key" ON "watch_colors"("watchId", "colorId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "watch_categories_watchId_idx" ON "watch_categories"("watchId");

-- CreateIndex
CREATE INDEX "watch_categories_categoryId_idx" ON "watch_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "watch_categories_watchId_categoryId_key" ON "watch_categories"("watchId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "concepts_name_key" ON "concepts"("name");

-- CreateIndex
CREATE INDEX "concepts_name_idx" ON "concepts"("name");

-- CreateIndex
CREATE INDEX "watch_concepts_watchId_idx" ON "watch_concepts"("watchId");

-- CreateIndex
CREATE INDEX "watch_concepts_conceptId_idx" ON "watch_concepts"("conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "watch_concepts_watchId_conceptId_key" ON "watch_concepts"("watchId", "conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "materials_name_key" ON "materials"("name");

-- CreateIndex
CREATE INDEX "materials_name_idx" ON "materials"("name");

-- CreateIndex
CREATE INDEX "watch_materials_watchId_idx" ON "watch_materials"("watchId");

-- CreateIndex
CREATE INDEX "watch_materials_materialId_idx" ON "watch_materials"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "watch_materials_watchId_materialId_key" ON "watch_materials"("watchId", "materialId");

-- CreateIndex
CREATE INDEX "watch_specification_headings_watchId_idx" ON "watch_specification_headings"("watchId");

-- CreateIndex
CREATE INDEX "watch_specification_headings_heading_idx" ON "watch_specification_headings"("heading");

-- CreateIndex
CREATE INDEX "watch_specification_points_headingId_idx" ON "watch_specification_points"("headingId");

-- CreateIndex
CREATE INDEX "watch_specification_points_label_idx" ON "watch_specification_points"("label");

-- CreateIndex
CREATE INDEX "watch_photos_watchId_idx" ON "watch_photos"("watchId");

-- CreateIndex
CREATE INDEX "watch_photos_watchId_order_idx" ON "watch_photos"("watchId", "order");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_watches" ADD CONSTRAINT "booking_watches_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_watches" ADD CONSTRAINT "booking_watches_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watches" ADD CONSTRAINT "watches_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_colors" ADD CONSTRAINT "watch_colors_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_colors" ADD CONSTRAINT "watch_colors_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_categories" ADD CONSTRAINT "watch_categories_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_categories" ADD CONSTRAINT "watch_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_concepts" ADD CONSTRAINT "watch_concepts_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_concepts" ADD CONSTRAINT "watch_concepts_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_materials" ADD CONSTRAINT "watch_materials_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_materials" ADD CONSTRAINT "watch_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_specification_headings" ADD CONSTRAINT "watch_specification_headings_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_specification_points" ADD CONSTRAINT "watch_specification_points_headingId_fkey" FOREIGN KEY ("headingId") REFERENCES "watch_specification_headings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_photos" ADD CONSTRAINT "watch_photos_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "watches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
