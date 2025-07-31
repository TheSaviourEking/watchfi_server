/*
  Warnings:

  - You are about to alter the column `price` on the `watches` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "watches" ALTER COLUMN "price" SET DATA TYPE BIGINT,
ALTER COLUMN "detail" SET DATA TYPE TEXT;
