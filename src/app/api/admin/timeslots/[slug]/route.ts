import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ====== Xác thực Admin ======
async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    const admin = await prisma.user.findFirst({
      where: { id: decoded.id, email: decoded.email, role: "ADMIN" },
    });

    return admin;
  } catch (err) {
    console.error("Verify token failed:", err);
    return null;
  }
}

// ====== PUT /api/admin/time-slots/[slug] ======
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  console.log("=== PUT /api/admin/time-slots/[slug] ===");
const { slug } = await params;

  try {
    const admin = await verifyAdminToken(request);
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const body = await request.json();
    const { time, price, isActive, isWeekend } = body;

    // Kiểm tra khung giờ tồn tại
    const existing = await prisma.timeSlot.findUnique({
      where: { id: slug },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khung giờ" },
        { status: 404 }
      );
    }

    // Cập nhật khung giờ
    const updated = await prisma.timeSlot.update({
      where: { id: slug },
      data: {
        ...(time !== undefined && { time }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(isActive !== undefined && { isActive }),
        // ...(isWeekend !== undefined && { isWeekend }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật khung giờ thành công",
      data: updated,
    });
  } catch (err) {
    console.error("Update TimeSlot error:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật khung giờ" },
      { status: 500 }
    );
  }
}

// ====== DELETE /api/admin/time-slots/[slug] ======
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  console.log("=== DELETE /api/admin/time-slots/[slug] ===");
  const { slug } = params;

  try {
    const admin = await verifyAdminToken(request);
    if (!admin)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    // Kiểm tra khung giờ
    const existing = await prisma.timeSlot.findUnique({
      where: { id: slug },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khung giờ để xóa" },
        { status: 404 }
      );
    }

    await prisma.timeSlot.delete({
      where: { id: slug },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa khung giờ thành công",
    });
  } catch (err) {
    console.error("Delete TimeSlot error:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa khung giờ" },
      { status: 500 }
    );
  }
}
