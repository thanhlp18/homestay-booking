import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ========== Verify Admin Token ==========
async function verifyAdminToken(request: NextRequest) {
  console.log("=== Verify Admin Token ===");
  const token = request.cookies.get("adminToken")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const admin = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        email: decoded.email,
        role: "ADMIN",
      },
    });

    console.log("Admin verified:", !!admin);
    return admin;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}

// ========== POST /api/admin/timeslots ==========
export async function POST(request: NextRequest) {
  console.log("=== POST /api/admin/timeslots ===");

  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log("Unauthorized admin");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      roomId, 
      time, 
      price, 
      duration, 
      isOvernight = false, 
      weekendSurcharge = 0,
      isActive = true 
    } = body;

    // Validate input
    if (!roomId || !time || price == null) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin bắt buộc (roomId, time, price)",
        },
        { status: 400 }
      );
    }

    // Validate duration for non-overnight packages
    if (!isOvernight && !duration) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập thời lượng (duration) cho gói giờ thông thường",
        },
        { status: 400 }
      );
    }

    // Check room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Phòng không tồn tại" },
        { status: 400 }
      );
    }

    // Check if timeslot already exists
    const existing = await prisma.timeSlot.findFirst({
      where: {
        roomId,
        time,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Khung giờ này đã tồn tại cho phòng này" },
        { status: 400 }
      );
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        roomId,
        time,
        price: parseInt(price),
        duration: duration ? parseInt(duration) : null,
        isOvernight,
        weekendSurcharge: parseInt(weekendSurcharge),
        isActive,
      },
    });

    console.log("Created TimeSlot:", timeSlot.id);

    return NextResponse.json({
      success: true,
      message: "Đã tạo khung giờ thành công",
      data: timeSlot,
    });
  } catch (error) {
    console.error("Create timeslot error:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi tạo khung giờ" },
      { status: 500 }
    );
  }
}

// ========== GET /api/admin/timeslots ==========
export async function GET(request: NextRequest) {
  console.log("=== GET /api/admin/timeslots ===");

  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    const filters: any = {};
    if (roomId) filters.roomId = roomId;

    const timeSlots = await prisma.timeSlot.findMany({
      where: filters,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            branch: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched timeSlots:", timeSlots.length);

    return NextResponse.json({
      success: true,
      data: timeSlots,
    });
  } catch (error) {
    console.error("Get timeslot error:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi tải danh sách khung giờ" },
      { status: 500 }
    );
  }
}
