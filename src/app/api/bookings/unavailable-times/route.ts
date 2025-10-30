// src/app/api/bookings/unavailable-times/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const roomId = searchParams.get("roomId");
    const timeSlotId = searchParams.get("timeSlotId");

    if (!date || !roomId || !timeSlotId) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        timeSlotId: timeSlotId,
        status: {
          in: ["PENDING", "PAYMENT_CONFIRMED", "APPROVED"],
        },
        checkInDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        checkInDateTime: true,
        checkOutDateTime: true,
      },
    });

    // Return raw slot data for conflict checking
    const unavailableSlots = bookings.map((booking) => ({
      checkIn: booking.checkInDateTime!.toISOString(),
      checkOut: booking.checkOutDateTime!.toISOString(),
      bookingId: booking.id,
    }));

    return NextResponse.json({
      success: true,
      unavailableSlots,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching unavailable times:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching unavailable times" },
      { status: 500 }
    );
  }
}
