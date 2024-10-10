-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'USED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SOLD');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT,
    "verificationStatus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearOfPurchase" INTEGER NOT NULL,
    "condition" "Condition" NOT NULL,
    "storageCapacity" TEXT NOT NULL,
    "defects" TEXT[],
    "serialNumber" TEXT,
    "pictures" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "estimatedPrice" DOUBLE PRECISION NOT NULL,
    "Time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT,
    "estimatedPrice" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "pickup" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "Device"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_deviceId_key" ON "Transaction"("deviceId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
