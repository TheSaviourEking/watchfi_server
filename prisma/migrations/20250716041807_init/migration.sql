/*
  Warnings:

  - You are about to drop the column `paymentMethodId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the `payment_methods` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CryptoPaymentType" AS ENUM ('SOL', 'USDC');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CONFIRMING';

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_customerId_fkey";

-- DropIndex
DROP INDEX "bookings_paymentMethodId_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "paymentMethodId";

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "walletAddress" VARCHAR(44);

-- DropTable
DROP TABLE "payment_methods";

-- CreateTable
CREATE TABLE "crypto_payments" (
    "id" VARCHAR(36) NOT NULL,
    "bookingId" VARCHAR(36) NOT NULL,
    "transactionHash" VARCHAR(88) NOT NULL,
    "paymentType" "CryptoPaymentType" NOT NULL,
    "amount" DECIMAL(18,9) NOT NULL,
    "usdValue" DECIMAL(10,2) NOT NULL,
    "senderWallet" VARCHAR(44) NOT NULL,
    "receiverWallet" VARCHAR(44) NOT NULL,
    "blockTime" TIMESTAMP(3),
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crypto_payments_transactionHash_key" ON "crypto_payments"("transactionHash");

-- CreateIndex
CREATE INDEX "crypto_payments_bookingId_idx" ON "crypto_payments"("bookingId");

-- CreateIndex
CREATE INDEX "crypto_payments_transactionHash_idx" ON "crypto_payments"("transactionHash");

-- CreateIndex
CREATE INDEX "crypto_payments_paymentType_idx" ON "crypto_payments"("paymentType");

-- CreateIndex
CREATE INDEX "crypto_payments_senderWallet_idx" ON "crypto_payments"("senderWallet");

-- CreateIndex
CREATE INDEX "crypto_payments_isConfirmed_idx" ON "crypto_payments"("isConfirmed");

-- CreateIndex
CREATE INDEX "crypto_payments_blockTime_idx" ON "crypto_payments"("blockTime");

-- CreateIndex
CREATE INDEX "customers_walletAddress_idx" ON "customers"("walletAddress");

-- AddForeignKey
ALTER TABLE "crypto_payments" ADD CONSTRAINT "crypto_payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
