/*
  Warnings:

  - The values [NEW,USED,DAMAGED] on the enum `Condition` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,APPROVED,REJECTED,SOLD] on the enum `DeviceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,COMPLETED] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `pickup` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `type` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryMethod` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Delivery" AS ENUM ('Pickup', 'Parcel');

-- AlterEnum
BEGIN;
CREATE TYPE "Condition_new" AS ENUM ('New', 'Used', 'Damaged');
ALTER TABLE "Device" ALTER COLUMN "condition" TYPE "Condition_new" USING ("condition"::text::"Condition_new");
ALTER TYPE "Condition" RENAME TO "Condition_old";
ALTER TYPE "Condition_new" RENAME TO "Condition";
DROP TYPE "Condition_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DeviceStatus_new" AS ENUM ('Pending', 'Approved', 'Sold');
ALTER TABLE "Device" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Device" ALTER COLUMN "status" TYPE "DeviceStatus_new" USING ("status"::text::"DeviceStatus_new");
ALTER TYPE "DeviceStatus" RENAME TO "DeviceStatus_old";
ALTER TYPE "DeviceStatus_new" RENAME TO "DeviceStatus";
DROP TYPE "DeviceStatus_old";
ALTER TABLE "Device" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('Pending', 'Completed');
ALTER TABLE "Transaction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "TransactionStatus_old";
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "pickup",
ADD COLUMN     "deliveryMethod" "Delivery" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Pending';
