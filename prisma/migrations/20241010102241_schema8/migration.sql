/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "paymentMethod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "cvv" TEXT NOT NULL,

    CONSTRAINT "paymentMethod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paymentMethod" ADD CONSTRAINT "paymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
