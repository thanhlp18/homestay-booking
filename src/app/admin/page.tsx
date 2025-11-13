"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Typography,
  Spin,
  Avatar,
  Dropdown,
  Modal,
  message,
  Descriptions,
} from "antd";
import { adminApiCall, handleApiResponse } from "@/lib/adminApi";
import {
  BookOutlined,
  HomeOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface BookingRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  frontIdImageUrl?: string;
  backIdImageUrl?: string;
  guests: number;
  notes: string;
  paymentMethod: string;
  status:
    | "PENDING"
    | "PAYMENT_CONFIRMED"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNotes?: string;
  totalPrice: number;
  basePrice: number;
  discountAmount?: number;
  discountPercentage?: number;
  weekendSurchargeApplied: number;
  guestSurcharge: number;
  room: {
    id: string;
    name: string;
    branch: {
      id: string;
      name: string;
      location: string;
    };
  };
  timeSlot: {
    id: string;
    time: string;
    duration?: number | null;
  };
}

interface DashboardStats {
  totalBookings: number;
  pendingApproval: number;
  approvedBookings: number;
  totalRevenue: number;
  totalBranches: number;
  totalRooms: number;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingApproval: 0,
    approvedBookings: 0,
    totalRevenue: 0,
    totalBranches: 0,
    totalRooms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchData();
    checkMobile();

    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bookings
      const bookingsResponse = await fetch("/api/bookings");
      const bookingsData = await bookingsResponse.json();
      const bookingsList = bookingsData.data || [];
      setBookings(bookingsList);

      // Fetch branches and rooms
      const branchesResponse = await fetch("/api/branches");
      const branchesData = await branchesResponse.json();
      const branchesList = branchesData.data || [];

      // Calculate stats
      const totalBookings = bookingsList.length;
      const pendingApproval = bookingsList.filter(
        (b: BookingRecord) => b.status === "PAYMENT_CONFIRMED"
      ).length;
      const approvedBookings = bookingsList.filter(
        (b: BookingRecord) => b.status === "APPROVED"
      ).length;
      const totalRevenue = bookingsList
        .filter((b: BookingRecord) => b.status === "APPROVED")
        .reduce((sum: number, b: BookingRecord) => sum + b.totalPrice, 0);
      const totalBranches = branchesList.length;
      const totalRooms = branchesList.reduce(
        (sum: number, branch: { rooms?: Array<unknown> }) =>
          sum + (branch.rooms?.length || 0),
        0
      );

      setStats({
        totalBookings,
        pendingApproval,
        approvedBookings,
        totalRevenue,
        totalBranches,
        totalRooms,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const response = await adminApiCall(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "approve",
        }),
      });

      await handleApiResponse(response);
      message.success("Đã phê duyệt đặt phòng thành công");
      await fetchData();
    } catch (error) {
      message.error("Không thể phê duyệt đặt phòng");
      console.error("Error approving booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const reason = prompt("Lý do từ chối đặt phòng:");
    if (!reason) return;

    try {
      setActionLoading(bookingId);
      const response = await adminApiCall(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "reject",
          reason,
        }),
      });

      await handleApiResponse(response);
      message.success("Đã từ chối đặt phòng thành công");
      await fetchData();
    } catch (error) {
      message.error("Không thể từ chối đặt phòng");
      console.error("Error rejecting booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Tag
            icon={<ClockCircleOutlined />}
            color="#fbe0a2"
            style={{ color: "#83311b", border: "1px solid #fbe0a2" }}
          >
            Chờ thanh toán
          </Tag>
        );
      case "PAYMENT_CONFIRMED":
        return (
          <Tag
            icon={<ClockCircleOutlined />}
            color="#1890ff"
            style={{ color: "#fff" }}
          >
            Chờ phê duyệt
          </Tag>
        );
      case "APPROVED":
        return (
          <Tag
            icon={<CheckCircleOutlined />}
            color="#605f3a"
            style={{ color: "#fff" }}
          >
            Đã phê duyệt
          </Tag>
        );
      case "REJECTED":
      case "CANCELLED":
        return (
          <Tag
            icon={<CloseCircleOutlined />}
            color="#83311b"
            style={{ color: "#fff" }}
          >
            Đã từ chối
          </Tag>
        );
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const columns: ColumnsType<BookingRecord> = [
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      fixed: "left",
      key: "fullName",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#83311b" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Phòng",
      key: "room",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: "#bd8049" }}>
            {record.room?.name || "-"}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {record.room?.branch?.location || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      key: "bookingDate",
      render: (_, record) => {
        if (!record.checkInDateTime) return "-";
        const checkIn = new Date(record.checkInDateTime).toLocaleString(
          "vi-VN"
        );
        const checkOut = record.checkOutDateTime
          ? new Date(record.checkOutDateTime).toLocaleString("vi-VN")
          : "-";
        return (
          <div>
            <div style={{ fontSize: "13px" }}>Check-in: {checkIn}</div>
            <div style={{ fontSize: "12px", color: "#999" }}>
              Check-out: {checkOut}
            </div>
            <div
              style={{ fontSize: "12px", color: "#bd8049", fontWeight: 500 }}
            >
              {record.timeSlot?.time || "-"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => (
        <span style={{ fontWeight: 600, color: "#605f3a", fontSize: "14px" }}>
          {price?.toLocaleString("vi-VN") || 0} đ
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => {
        const menuItems = [];

        // Luôn có nút xem chi tiết
        menuItems.push({
          key: "view",
          icon: <EyeOutlined />,
          label: "Chi tiết",
          onClick: () => handleViewDetails(record),
        });

        if (
          record.status === "PENDING" ||
          record.status === "PAYMENT_CONFIRMED"
        ) {
          menuItems.push(
            {
              key: "approve",
              icon: <CheckCircleOutlined />,
              label: "Phê duyệt",
              onClick: () => handleApproveBooking(record.id),
            },
            {
              key: "reject",
              icon: <CloseCircleOutlined />,
              label: "Từ chối",
              onClick: () => handleRejectBooking(record.id),
            }
          );
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              loading={actionLoading === record.id}
              style={{ fontSize: "20px" }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const renderMobileBookingCard = (booking: BookingRecord) => {
    return (
      <Card
        key={booking.id}
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 12 }}
        >
          <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              {booking.fullName}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {booking.phone}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <HomeOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <Text strong>{booking.room?.name || "-"}</Text>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <EnvironmentOutlined style={{ marginRight: 8, color: "#52c41a" }} />
            <Text>{booking.room?.branch?.location || "-"}</Text>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <CalendarOutlined style={{ marginRight: 8, color: "#faad14" }} />
            <div>
              <div style={{ fontSize: "14px" }}>
                Check-in:{" "}
                {booking.checkInDateTime
                  ? new Date(booking.checkInDateTime).toLocaleString("vi-VN")
                  : "-"}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Check-out:{" "}
                {booking.checkOutDateTime
                  ? new Date(booking.checkOutDateTime).toLocaleString("vi-VN")
                  : "-"}
              </div>
              <div style={{ fontSize: "12px", color: "#1890ff" }}>
                {booking.timeSlot?.time || "-"}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
              {booking.totalPrice?.toLocaleString("vi-VN") || 0} đ
            </Text>
          </div>
          {getStatusTag(booking.status)}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  icon: <EyeOutlined />,
                  label: "Chi tiết",
                  onClick: () => handleViewDetails(booking),
                },
                ...(booking.status === "PENDING" ||
                booking.status === "PAYMENT_CONFIRMED"
                  ? [
                      {
                        key: "approve",
                        icon: <CheckCircleOutlined />,
                        label: "Phê duyệt",
                        onClick: () => handleApproveBooking(booking.id),
                      },
                      {
                        key: "reject",
                        icon: <CloseCircleOutlined />,
                        label: "Từ chối",
                        onClick: () => handleRejectBooking(booking.id),
                      },
                    ]
                  : []),
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="primary"
              icon={<MoreOutlined />}
              loading={actionLoading === booking.id}
              size="large"
            >
              Thao tác
            </Button>
          </Dropdown>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title
        level={isMobile ? 3 : 2}
        style={{ marginBottom: isMobile ? 16 : 24, color: "#83311b" }}
      >
        Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: isMobile ? 16 : 24,
              background: "#ffffff",
              borderRadius: 12,
            }}
            style={{
              border: "1px solid #fbe0a2",
              boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#83311b",
                    fontWeight: 500,
                  }}
                >
                  Tổng đặt phòng
                </span>
              }
              value={stats.totalBookings}
              prefix={
                <BookOutlined
                  style={{
                    color: "#83311b",
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                />
              }
              valueStyle={{
                fontSize: isMobile ? "28px" : "36px",
                color: "#83311b",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: isMobile ? 16 : 24,
              background: "#ffffff",
              borderRadius: 12,
            }}
            style={{
              border: "1px solid #fbe0a2",
              boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#bd8049",
                    fontWeight: 500,
                  }}
                >
                  Chờ phê duyệt
                </span>
              }
              value={stats.pendingApproval}
              prefix={
                <ClockCircleOutlined
                  style={{
                    color: "#bd8049",
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                />
              }
              valueStyle={{
                color: "#bd8049",
                fontSize: isMobile ? "28px" : "36px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: isMobile ? 16 : 24,
              background: "#ffffff",
              borderRadius: 12,
            }}
            style={{
              border: "1px solid #fbe0a2",
              boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#605f3a",
                    fontWeight: 500,
                  }}
                >
                  Đã phê duyệt
                </span>
              }
              value={stats.approvedBookings}
              prefix={
                <CheckCircleOutlined
                  style={{
                    color: "#605f3a",
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                />
              }
              valueStyle={{
                color: "#605f3a",
                fontSize: isMobile ? "28px" : "36px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: isMobile ? 16 : 24,
              background: "#ffffff",
              borderRadius: 12,
            }}
            style={{
              border: "1px solid #fbe0a2",
              boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#bd8049",
                    fontWeight: 500,
                  }}
                >
                  Tổng doanh thu
                </span>
              }
              value={stats.totalRevenue}
              prefix={
                <DollarOutlined
                  style={{
                    color: "#bd8049",
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                />
              }
              valueStyle={{
                color: "#bd8049",
                fontSize: isMobile ? "28px" : "36px",
                fontWeight: "bold",
              }}
              formatter={(value) => `${value?.toLocaleString("vi-VN")} đ`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: isMobile ? 16 : 24,
              background: "#ffffff",
              borderRadius: 12,
            }}
            style={{
              border: "1px solid #fbe0a2",
              boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#83311b",
                    fontWeight: 500,
                  }}
                >
                  Tổng chi nhánh
                </span>
              }
              value={stats.totalBranches}
              prefix={
                <HomeOutlined
                  style={{
                    color: "#bd8049",
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                />
              }
              valueStyle={{
                fontSize: isMobile ? "28px" : "36px",
                color: "#bd8049",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card
            bodyStyle={{
              padding: isMobile ? 16 : 24,
              background: "#ffffff",
              borderRadius: 12,
            }}
            style={{
              border: "1px solid #fbe0a2",
              boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#83311b",
                    fontWeight: 500,
                  }}
                >
                  Tổng phòng
                </span>
              }
              value={stats.totalRooms}
              prefix={
                <HomeOutlined
                  style={{
                    color: "#bd8049",
                    fontSize: isMobile ? "20px" : "24px",
                  }}
                />
              }
              valueStyle={{
                fontSize: isMobile ? "28px" : "36px",
                color: "#bd8049",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings */}
      <Card
        title={
          <span
            style={{
              fontSize: isMobile ? "16px" : "18px",
              color: "#83311b",
              fontWeight: "bold",
            }}
          >
            Đặt phòng gần đây
          </span>
        }
        style={{
          marginBottom: 24,
          border: "1px solid #fbe0a2",
          boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
          borderRadius: 12,
          background: "#ffffff",
        }}
        bodyStyle={{ padding: isMobile ? 0 : 24 }}
        headStyle={{
          background: "white",
          borderBottom: "1px solid #fbe0a2",
          borderRadius: "12px 12px 0 0",
        }}
      >
        {isMobile ? (
          <div style={{ padding: isMobile ? 16 : 0 }}>
            {bookings.slice(0, 10).map(renderMobileBookingCard)}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={bookings.slice(0, 10)}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
            size="middle"
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div
            style={{
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 600,
              padding: isMobile ? "8px 0" : "0",
            }}
          >
            Chi tiết đặt phòng
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={isMobile ? "100%" : 900}
        style={isMobile ? { top: 0, paddingBottom: 0 } : {}}
        bodyStyle={{
          maxHeight: isMobile ? "calc(100vh - 120px)" : "70vh",
          overflow: "auto",
          padding: isMobile ? "16px" : "24px",
        }}
        className="custom-scrollbar"
        destroyOnClose={true}
        maskClosable={!isMobile}
        keyboard={true}
      >
        {selectedBooking && (
          <div>
            <Descriptions
              column={isMobile ? 1 : 2}
              bordered
              size={isMobile ? "small" : "default"}
            >
              <Descriptions.Item label="Mã đặt phòng" span={isMobile ? 1 : 2}>
                {selectedBooking.id}
              </Descriptions.Item>
              <Descriptions.Item label="Họ tên">
                {selectedBooking.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedBooking.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedBooking.email || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="CCCD">
                {selectedBooking.cccd}
              </Descriptions.Item>
              <Descriptions.Item label="Số khách">
                {selectedBooking.guests} người
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedBooking.paymentMethod === "CASH"
                  ? "Tiền mặt"
                  : selectedBooking.paymentMethod === "TRANSFER"
                  ? "Chuyển khoản"
                  : "Thẻ"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={isMobile ? 1 : 2}>
                {getStatusTag(selectedBooking.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng" span={isMobile ? 1 : 2}>
                {selectedBooking.room?.name} -{" "}
                {selectedBooking.room?.branch?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh" span={isMobile ? 1 : 2}>
                {selectedBooking.room?.branch?.location}
              </Descriptions.Item>
              <Descriptions.Item label="Gói thời gian" span={isMobile ? 1 : 2}>
                {selectedBooking.timeSlot?.time}
                {selectedBooking.timeSlot?.duration &&
                  ` (${selectedBooking.timeSlot.duration}h)`}
              </Descriptions.Item>
              <Descriptions.Item label="Check-in" span={isMobile ? 1 : 2}>
                {new Date(selectedBooking.checkInDateTime).toLocaleString(
                  "vi-VN"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Check-out" span={isMobile ? 1 : 2}>
                {new Date(selectedBooking.checkOutDateTime).toLocaleString(
                  "vi-VN"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cơ bản">
                {selectedBooking.basePrice?.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
              {selectedBooking.discountAmount !== undefined &&
                selectedBooking.discountAmount > 0 && (
                  <Descriptions.Item label="Giảm giá">
                    {selectedBooking.discountAmount.toLocaleString("vi-VN")} đ (
                    {selectedBooking.discountPercentage
                      ? selectedBooking.discountPercentage * 100
                      : 0}
                    %)
                  </Descriptions.Item>
                )}
              <Descriptions.Item label="Phụ phí khách">
                {selectedBooking.guestSurcharge?.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <strong>
                  {selectedBooking.totalPrice?.toLocaleString("vi-VN")} đ
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={isMobile ? 1 : 2}>
                {selectedBooking.notes || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú admin" span={isMobile ? 1 : 2}>
                {selectedBooking.adminNotes || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedBooking.createdAt).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {new Date(selectedBooking.updatedAt).toLocaleString("vi-VN")}
              </Descriptions.Item>
              {selectedBooking.approvedAt && (
                <Descriptions.Item label="Ngày phê duyệt">
                  {new Date(selectedBooking.approvedAt).toLocaleString("vi-VN")}
                </Descriptions.Item>
              )}
              {selectedBooking.rejectedAt && (
                <Descriptions.Item label="Ngày từ chối">
                  {new Date(selectedBooking.rejectedAt).toLocaleString("vi-VN")}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Hiển thị ảnh CCCD */}
            {(selectedBooking.frontIdImageUrl ||
              selectedBooking.backIdImageUrl) && (
              <div style={{ marginTop: 24 }}>
                <Title level={5} style={{ color: "#83311b", marginBottom: 16 }}>
                  Ảnh CCCD xác minh
                </Title>
                <Row gutter={[16, 16]}>
                  {selectedBooking.frontIdImageUrl && (
                    <Col xs={24} sm={12}>
                      <div
                        style={{
                          border: "2px solid #fbe0a2",
                          borderRadius: 8,
                          padding: 8,
                          background: "#fefdf8",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: 8,
                            color: "#83311b",
                          }}
                        >
                          Mặt trước CCCD
                        </div>
                        <img
                          src={selectedBooking.frontIdImageUrl}
                          alt="CCCD Mặt trước"
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            window.open(
                              selectedBooking.frontIdImageUrl,
                              "_blank"
                            )
                          }
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
