/*
  Warnings:

  - You are about to alter the column `amount` on the `crypto_payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,9)` to `Decimal(18,6)`.
  - A unique constraint covering the columns `[pseudonym]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bookings_paymentStatus_idx";

-- DropIndex
DROP INDEX "bookings_shipmentStatus_idx";

-- DropIndex
DROP INDEX "bookings_status_idx";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "crypto_payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "senderWallet" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "receiverWallet" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "walletAddress" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE INDEX "bookings_deletedAt_idx" ON "bookings"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "customers_pseudonym_key" ON "customers"("pseudonym");

-- CreateIndex
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");
