/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "customers_pseudonym_key";

-- CreateIndex
CREATE UNIQUE INDEX "customers_walletAddress_key" ON "customers"("walletAddress");
