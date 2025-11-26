// src/app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { sendBookingApproval, sendBookingRejection } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest) {
  console.log("=== Admin Token Verification ===");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);

  const allCookies = request.cookies.getAll();
  console.log("All cookies:", allCookies);

  const token = request.cookies.get("adminToken")?.value;
  console.log("Admin token found:", !!token);
  console.log("Token value:", token ? `${token.substring(0, 20)}...` : "null");

  if (!token) {
    console.log("No admin token found in cookies");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    console.log("Token decoded successfully:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    const admin = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        email: decoded.email,
        role: "ADMIN",
      },
    });

    console.log("Admin found in database:", !!admin);
    if (admin) {
      console.log("Admin details:", {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      });
    }

    return admin;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Update booking status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  console.log("=== PATCH /api/admin/bookings/[id] ===");

  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log("Unauthorized: No valid admin token");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Authorized admin:", admin.name);

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    // Check if booking exists - CẬP NHẬT INCLUDE
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            branch: true,
          },
        },
        timeSlot: true, // ← Thay bookingSlots bằng room và timeSlot trực tiếp
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Đặt phòng không tồn tại" },
        { status: 404 }
      );
    }

    let updateData: {
      status: "APPROVED" | "REJECTED";
      approvedAt?: Date;
      rejectedAt?: Date;
      adminNotes: string;
    } = {
      status: "APPROVED" as const,
      adminNotes: "",
    };
    let message = "";

    if (action === "approve") {
      if (booking.status === "APPROVED") {
        return NextResponse.json(
          { success: false, message: "Đặt phòng đã được phê duyệt" },
          { status: 400 }
        );
      }

      updateData = {
        status: "APPROVED",
        approvedAt: new Date(),
        adminNotes: reason || "Được phê duyệt bởi admin",
      };
      message = "Đã phê duyệt đặt phòng thành công";
    } else if (action === "reject") {
      if (booking.status === "REJECTED") {
        return NextResponse.json(
          { success: false, message: "Đặt phòng đã bị từ chối" },
          { status: 400 }
        );
      }

      updateData = {
        status: "REJECTED",
        rejectedAt: new Date(),
        adminNotes: reason || "Bị từ chối bởi admin",
      };
      message = "Đã từ chối đặt phòng thành công";
    } else {
      return NextResponse.json(
        { success: false, message: "Hành động không hợp lệ" },
        { status: 400 }
      );
    }

    // Update booking - CẬP NHẬT INCLUDE
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        room: {
          include: {
            branch: true,
          },
        },
        timeSlot: true, // ← Thay bookingSlots bằng room và timeSlot
      },
    });

    console.log("Booking updated successfully:", updatedBooking.id);

    // Send email notification to user
    if (updatedBooking.email) {
      try {
        // Transform booking data to match email template interface
        const emailData = {
          id: updatedBooking.id,
          fullName: updatedBooking.fullName,
          phone: updatedBooking.phone,
          email: updatedBooking.email,
          cccd: updatedBooking.cccd,
          guests: updatedBooking.guests,
          notes: updatedBooking.notes || undefined,
          paymentMethod: updatedBooking.paymentMethod as
            | "CASH"
            | "TRANSFER"
            | "CARD",
          room: updatedBooking.room?.name || "",
          location: updatedBooking.room?.branch?.location || "",
          totalPrice: updatedBooking.totalPrice,
          basePrice: updatedBooking.basePrice || undefined,
          discountAmount: updatedBooking.discountAmount || undefined,
          discountPercentage: updatedBooking.discountPercentage || undefined,
          checkInDateTime: updatedBooking.checkInDateTime || undefined,
          checkOutDateTime: updatedBooking.checkOutDateTime || undefined,
          checkInTime: updatedBooking.room?.checkIn,
          checkOutTime: updatedBooking.room?.checkOut,
          branchAddress: updatedBooking.room?.branch?.address,
          googleMapUrl: updatedBooking.room?.branch?.googleMapUrl || undefined,
        };

        if (action === "approve") {
          await sendBookingApproval(emailData);
          console.log("Approval email sent to:", updatedBooking.email);
        } else if (action === "reject") {
          await sendBookingRejection(
            emailData,
            reason || "Bị từ chối bởi admin"
          );
          console.log("Rejection email sent to:", updatedBooking.email);
        }
      } catch (emailError) {
        // Log email error but don't fail the API call
        console.error("Error sending email notification:", emailError);
        // Continue with the response even if email fails
      }
    } else {
      console.log("Skipping email notification - no email address provided");
    }

    return NextResponse.json({
      success: true,
      message,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi cập nhật đặt phòng" },
      { status: 500 }
    );
  }
}

// Get single booking - CẬP NHẬT INCLUDE
export async function GET(request: NextRequest, { params }: RouteParams) {
  console.log("=== GET /api/admin/bookings/[id] ===");

  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log("Unauthorized: No valid admin token");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Authorized admin:", admin.name);

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            branch: true,
          },
        },
        timeSlot: true, // ← Thay bookingSlots
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Đặt phòng không tồn tại" },
        { status: 404 }
      );
    }

    console.log("Booking fetched successfully:", booking.id);

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi tải thông tin đặt phòng" },
      { status: 500 }
    );
  }
}

// Cancel booking
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  console.log("=== DELETE /api/admin/bookings/[id] ===");

  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      console.log("Unauthorized: No valid admin token");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Authorized admin:", admin.name);

    const { id } = await params;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Đặt phòng không tồn tại" },
        { status: 404 }
      );
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        adminNotes: "Đã hủy bởi admin",
      },
    });

    console.log("Booking cancelled successfully:", updatedBooking.id);

    return NextResponse.json({
      success: true,
      message: "Đã hủy đặt phòng thành công",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi hủy đặt phòng" },
      { status: 500 }
    );
  }
}
