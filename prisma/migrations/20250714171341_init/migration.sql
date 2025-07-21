/*
  Warnings:

  - You are about to alter the column `paymentMethodId` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(64)` to `VarChar(36)`.

*/
-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "paymentMethodId" SET DATA TYPE VARCHAR(36);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" VARCHAR(36) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "gatewayId" VARCHAR(64) NOT NULL,
    "details" VARCHAR(255),
    "customerId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_methods_customerId_idx" ON "payment_methods"("customerId");

-- CreateIndex
CREATE INDEX "bookings_paymentMethodId_idx" ON "bookings"("paymentMethodId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
