/*
  Warnings:

  - You are about to drop the `booking_slots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSlotId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."booking_slots" DROP CONSTRAINT "booking_slots_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."booking_slots" DROP CONSTRAINT "booking_slots_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."booking_slots" DROP CONSTRAINT "booking_slots_timeSlotId_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "checkInDateTime" TIMESTAMP(3),
ADD COLUMN     "checkOutDateTime" TIMESTAMP(3),
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD COLUMN     "timeSlotId" TEXT NOT NULL,
ADD COLUMN     "weekendSurchargeApplied" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "floor" TEXT;

-- AlterTable
ALTER TABLE "time_slots" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "isOvernight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weekendSurcharge" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."booking_slots";

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
