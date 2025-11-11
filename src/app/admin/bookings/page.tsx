"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  Typography,
  Descriptions,
  message,
  Popconfirm,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Avatar,
  Dropdown,
  Menu,
} from "antd";
import type { Dayjs } from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker";

import { adminApiCall, handleApiResponse } from "@/lib/adminApi";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// ✅ CẬP NHẬT INTERFACE - Không còn bookingSlots
interface BookingRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  cccdFrontImage?: string;
  cccdBackImage?: string;
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
  approvedAt?: string;
  rejectedAt?: string;
  adminNotes?: string;
  totalPrice: number;
  basePrice: number;
  discountAmount: number;
  discountPercentage: number;
  guestSurcharge: number;
  checkInDateTime: string; // ← Thêm field mới
  checkOutDateTime: string; // ← Thêm field mới
  // Direct relations thay vì bookingSlots
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
    duration: number | null;
  };
}

interface BookingStats {
  total: number;
  pending: number;
  paymentConfirmed: number;
  approved: number;
  rejected: number;
  cancelled: number;
  totalRevenue: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    paymentConfirmed: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status: string;
    dateRange: any;
  }>({
    status: "",
    dateRange: null,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchBookings();
    checkMobile();

    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [filters]);

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);

      let url = "/api/bookings?limit=100";

      if (filters.status) {
        url += `&status=${filters.status}`;
      }

      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange;
        url += `&startDate=${startDate.format(
          "YYYY-MM-DD"
        )}&endDate=${endDate.format("YYYY-MM-DD")}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      const bookingsList = data.data || [];
      setBookings(bookingsList);

      // Calculate stats
      const total = bookingsList.length;
      const pending = bookingsList.filter(
        (b: BookingRecord) => b.status === "PENDING"
      ).length;
      const paymentConfirmed = bookingsList.filter(
        (b: BookingRecord) => b.status === "PAYMENT_CONFIRMED"
      ).length;
      const approved = bookingsList.filter(
        (b: BookingRecord) => b.status === "APPROVED"
      ).length;
      const rejected = bookingsList.filter(
        (b: BookingRecord) => b.status === "REJECTED"
      ).length;
      const cancelled = bookingsList.filter(
        (b: BookingRecord) => b.status === "CANCELLED"
      ).length;
      const totalRevenue = bookingsList
        .filter((b: BookingRecord) => b.status === "APPROVED")
        .reduce((sum: number, b: BookingRecord) => sum + b.totalPrice, 0);

      setStats({
        total,
        pending,
        paymentConfirmed,
        approved,
        rejected,
        cancelled,
        totalRevenue,
      });
    } catch {
      message.error("Không thể tải danh sách đặt phòng");
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
      await fetchBookings();
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
      await fetchBookings();
    } catch (error) {
      message.error("Không thể từ chối đặt phòng");
      console.error("Error rejecting booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const response = await adminApiCall(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });

      await handleApiResponse(response);
      message.success("Đã hủy đặt phòng thành công");
      await fetchBookings();
    } catch (error) {
      message.error("Không thể hủy đặt phòng");
      console.error("Error canceling booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Tag icon={<ClockCircleOutlined />} color="orange">
            Chờ thanh toán
          </Tag>
        );
      case "PAYMENT_CONFIRMED":
        return (
          <Tag icon={<ClockCircleOutlined />} color="blue">
            Chờ phê duyệt
          </Tag>
        );
      case "APPROVED":
        return (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Đã phê duyệt
          </Tag>
        );
      case "REJECTED":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            Đã từ chối
          </Tag>
        );
      case "CANCELLED":
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            Đã hủy
          </Tag>
        );
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  // ✅ CẬP NHẬT COLUMNS - Dùng room và timeSlot trực tiếp
  const columns: ColumnsType<BookingRecord> = [
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.phone}</div>
          {record.email && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Phòng & Chi nhánh",
      key: "room",
      render: (_, record) => (
        <div>
          <div>{record.room?.name || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.room?.branch?.name} - {record.room?.branch?.location}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "bookingTime",
      render: (_, record) => {
        const checkIn = new Date(record.checkInDateTime);
        const checkOut = new Date(record.checkOutDateTime);

        return (
          <div>
            <div style={{ fontSize: "12px" }}>
              <strong>Check-in:</strong> {checkIn.toLocaleString("vi-VN")}
            </div>
            <div style={{ fontSize: "12px" }}>
              <strong>Check-out:</strong> {checkOut.toLocaleString("vi-VN")}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Gói: {record.timeSlot?.time || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thông tin",
      key: "info",
      render: (_, record) => (
        <div>
          <div>{record.guests} khách</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.paymentMethod === "CASH"
              ? "Tiền mặt"
              : record.paymentMethod === "TRANSFER"
              ? "Chuyển khoản"
              : "Thẻ"}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => `${price.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      fixed: "right",
      key: "actions",
      width: 80,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Chi tiết',
            onClick: () => handleViewDetails(record),
          },
        ];

        if (record.status === "PENDING" || record.status === "PAYMENT_CONFIRMED") {
          menuItems.push(
            {
              key: 'approve',
              icon: <CheckCircleOutlined />,
              label: 'Phê duyệt',
              onClick: () => handleApproveBooking(record.id),
            },
            {
              key: 'reject',
              icon: <CloseCircleOutlined />,
              label: 'Từ chối',
              onClick: () => handleRejectBooking(record.id),
              // danger: true,
            }
          );
        }

        if (record.status !== "CANCELLED") {
          menuItems.push({
            key: 'cancel',
            icon: <CloseCircleOutlined />,
            label: 'Hủy',
            onClick: () => {
              Modal.confirm({
                title: 'Bạn có chắc chắn muốn hủy đặt phòng này?',
                okText: 'Có',
                cancelText: 'Không',
                onOk: () => handleCancelBooking(record.id),
              });
            },
            // danger: true,
          });
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              loading={actionLoading === record.id}
              style={{ fontSize: '20px' }}
            />
          </Dropdown>
        );
      },
    },
  ];

  // ✅ CẬP NHẬT MOBILE CARD
  const renderMobileBookingCard = (booking: BookingRecord) => {
    const checkIn = new Date(booking.checkInDateTime);
    const checkOut = new Date(booking.checkOutDateTime);

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
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              {booking.fullName}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {booking.phone}
            </div>
            {booking.email && (
              <div style={{ color: "#666", fontSize: "12px" }}>
                {booking.email}
              </div>
            )}
          </div>
          {getStatusTag(booking.status)}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <HomeOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <Text strong>{booking.room?.name || "N/A"}</Text>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <EnvironmentOutlined style={{ marginRight: 8, color: "#52c41a" }} />
            <Text>
              {booking.room?.branch?.name} - {booking.room?.branch?.location}
            </Text>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <CalendarOutlined style={{ marginRight: 8, color: "#faad14" }} />
            <div>
              <div style={{ fontSize: "12px" }}>
                Check-in: {checkIn.toLocaleString("vi-VN")}
              </div>
              <div style={{ fontSize: "12px" }}>
                Check-out: {checkOut.toLocaleString("vi-VN")}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                Gói: {booking.timeSlot?.time || "N/A"}
              </div>
            </div>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <UserOutlined style={{ marginRight: 8, color: "#722ed1" }} />
            <Text>
              {booking.guests} khách -{" "}
              {booking.paymentMethod === "CASH"
                ? "Tiền mặt"
                : booking.paymentMethod === "TRANSFER"
                ? "Chuyển khoản"
                : "Thẻ"}
            </Text>
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
              {booking.totalPrice.toLocaleString("vi-VN")} đ
            </Text>
          </div>
          <Text style={{ fontSize: "12px", color: "#666" }}>
            {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: 'Chi tiết',
                  onClick: () => handleViewDetails(booking),
                },
                ...(booking.status === "PENDING" || booking.status === "PAYMENT_CONFIRMED"
                  ? [
                      {
                        key: 'approve',
                        icon: <CheckCircleOutlined />,
                        label: 'Phê duyệt',
                        onClick: () => handleApproveBooking(booking.id),
                      },
                      {
                        key: 'reject',
                        icon: <CloseCircleOutlined />,
                        label: 'Từ chối',
                        onClick: () => handleRejectBooking(booking.id),
                        danger: true,
                      },
                    ]
                  : []),
                ...(booking.status !== "CANCELLED"
                  ? [
                      {
                        key: 'cancel',
                        icon: <CloseCircleOutlined />,
                        label: 'Hủy',
                        onClick: () => {
                          Modal.confirm({
                            title: 'Bạn có chắc chắn muốn hủy đặt phòng này?',
                            okText: 'Có',
                            cancelText: 'Không',
                            onOk: () => handleCancelBooking(booking.id),
                          });
                        },
                        danger: true,
                      },
                    ]
                  : []),
              ],
            }}
            trigger={['click']}
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

  return (
    <div>
      <Title
        level={isMobile ? 3 : 2}
        style={{ marginBottom: isMobile ? 16 : 24, color: "#83311b" }}
      >
        Quản lý đặt phòng
      </Title>

      {/* Statistics */}
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
              value={stats.total}
              prefix={
                <CalendarOutlined
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
              value={stats.paymentConfirmed}
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
              value={stats.approved}
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

      {/* Filters */}
      <Card
        style={{
          marginBottom: 16,
          border: "1px solid #fbe0a2",
          boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
          borderRadius: 12,
          background: "#ffffff",
        }}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          size="middle"
          style={{ width: "100%" }}
        >
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: isMobile ? "100%" : 200 }}
            onChange={(value) =>
              setFilters({ ...filters, status: value || "" })
            }
          >
            <Option value="">Tất cả</Option>
            <Option value="PENDING">Chờ thanh toán</Option>
            <Option value="PAYMENT_CONFIRMED">Chờ phê duyệt</Option>
            <Option value="APPROVED">Đã phê duyệt</Option>
            <Option value="REJECTED">Đã từ chối</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <RangePicker
            style={{ width: isMobile ? "100%" : "auto" }}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
          />
        </Space>
      </Card>

      {/* Bookings Table/Cards */}
      <Card
        bodyStyle={{ padding: isMobile ? 0 : 24 }}
        style={{
          border: "1px solid #fbe0a2",
          boxShadow: "0 4px 12px rgba(189, 128, 73, 0.1)",
          borderRadius: 12,
          background: "#ffffff",
        }}
      >
        {isMobile ? (
          <div style={{ padding: isMobile ? 16 : 0 }}>
            {bookings.map(renderMobileBookingCard)}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đặt phòng`,
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* ✅ CẬP NHẬT DETAIL MODAL */}
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
              {/* CCCD number removed per UI change: no longer display customer's ID number */}
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
                {selectedBooking.basePrice.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                {selectedBooking.discountAmount.toLocaleString("vi-VN")} đ (
                {selectedBooking.discountPercentage * 100}%)
              </Descriptions.Item>
              <Descriptions.Item label="Phụ phí khách">
                {selectedBooking.guestSurcharge.toLocaleString("vi-VN")} đ
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <strong>
                  {selectedBooking.totalPrice.toLocaleString("vi-VN")} đ
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

            {/* Hiển thị ảnh CCCD (chỉ mặt trước) */}
            {selectedBooking.cccdFrontImage && (
              <div style={{ marginTop: 24 }}>
                <Title level={5} style={{ color: "#83311b", marginBottom: 16 }}>
                  Ảnh CCCD xác minh
                </Title>
                <Row gutter={[16, 16]}>
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
                        src={selectedBooking.cccdFrontImage}
                        alt="CCCD Mặt trước"
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(selectedBooking.cccdFrontImage, "_blank")}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
