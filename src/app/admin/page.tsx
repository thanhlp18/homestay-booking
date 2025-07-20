'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Spin, Avatar } from 'antd';
import { adminApiCall, handleApiResponse } from '@/lib/adminApi';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface BookingRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  guests: number;
  notes: string;
  paymentMethod: string;
  status: 'PENDING' | 'PAYMENT_CONFIRMED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNotes?: string;
  totalPrice: number;
  basePrice: number;
  discountAmount: number;
  discountPercentage: number;
  bookingSlots: Array<{
    id: string;
    bookingDate: string;
    price: number;
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
    };
  }>;
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchData();
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();
      const bookingsList = bookingsData.data || [];
      setBookings(bookingsList);

      // Fetch branches and rooms
      const branchesResponse = await fetch('/api/branches');
      const branchesData = await branchesResponse.json();
      const branchesList = branchesData.data || [];

      // Calculate stats
      const totalBookings = bookingsList.length;
      const pendingApproval = bookingsList.filter((b: BookingRecord) => 
        b.status === 'PAYMENT_CONFIRMED'
      ).length;
      const approvedBookings = bookingsList.filter((b: BookingRecord) => 
        b.status === 'APPROVED'
      ).length;
      const totalRevenue = bookingsList
        .filter((b: BookingRecord) => b.status === 'APPROVED')
        .reduce((sum: number, b: BookingRecord) => sum + b.totalPrice, 0);
      const totalBranches = branchesList.length;
      const totalRooms = branchesList.reduce((sum: number, branch: { rooms?: Array<unknown> }) => 
        sum + (branch.rooms?.length || 0), 0
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
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const response = await adminApiCall(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'approve',
        }),
      });

      await handleApiResponse(response);
      await fetchData();
    } catch (error) {
      console.error('Error approving booking:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const reason = prompt('Lý do từ chối đặt phòng:');
    if (!reason) return;

    try {
      setActionLoading(bookingId);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          reason,
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="orange">Chờ thanh toán</Tag>;
      case 'PAYMENT_CONFIRMED':
        return <Tag icon={<ClockCircleOutlined />} color="blue">Chờ phê duyệt</Tag>;
      case 'APPROVED':
        return <Tag icon={<CheckCircleOutlined />} color="green">Đã phê duyệt</Tag>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Tag icon={<CloseCircleOutlined />} color="red">Đã từ chối</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const columns: ColumnsType<BookingRecord> = [
    {
      title: 'Khách hàng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (_, record) => (
        <div>
          <div>{record.bookingSlots[0]?.room.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.bookingSlots[0]?.room.branch.location}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày đặt',
      key: 'bookingDate',
      render: (_, record) => (
        <div>
          {record.bookingSlots.map(slot => {
            const date = new Date(slot.bookingDate).toLocaleDateString('vi-VN');
            return `${date} - ${slot.timeSlot.time}`;
          }).join(', ')}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `${price.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space direction={isMobile ? 'vertical' : 'horizontal'} size="small">
          {(record.status === 'PENDING' || record.status === 'PAYMENT_CONFIRMED') && (
            <>
              <Button
                type="primary"
                size="small"
                loading={actionLoading === record.id}
                onClick={() => handleApproveBooking(record.id)}
                style={{ width: isMobile ? '100%' : 'auto' }}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                size="small"
                loading={actionLoading === record.id}
                onClick={() => handleRejectBooking(record.id)}
                style={{ width: isMobile ? '100%' : 'auto' }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const renderMobileBookingCard = (booking: BookingRecord) => (
    <Card 
      key={booking.id} 
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{booking.fullName}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {booking.phone}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <Text strong>{booking.bookingSlots[0]?.room.name}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          <Text>{booking.bookingSlots[0]?.room.branch.location}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#faad14' }} />
          <Text>
            {booking.bookingSlots.map(slot => {
              const date = new Date(slot.bookingDate).toLocaleDateString('vi-VN');
              return `${date} - ${slot.timeSlot.time}`;
            }).join(', ')}
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
            {booking.totalPrice.toLocaleString('vi-VN')} đ
          </Text>
        </div>
        {getStatusTag(booking.status)}
      </div>

      {(booking.status === 'PENDING' || booking.status === 'PAYMENT_CONFIRMED') && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            size="small"
            loading={actionLoading === booking.id}
            onClick={() => handleApproveBooking(booking.id)}
            style={{ flex: 1 }}
          >
            Phê duyệt
          </Button>
          <Button
            danger
            size="small"
            loading={actionLoading === booking.id}
            onClick={() => handleRejectBooking(booking.id)}
            style={{ flex: 1 }}
          >
            Từ chối
          </Button>
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={isMobile ? 3 : 2} style={{ marginBottom: isMobile ? 16 : 24 }}>
        Dashboard
      </Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Tổng đặt phòng</span>}
              value={stats.totalBookings}
              prefix={<BookOutlined />}
              valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Chờ phê duyệt</span>}
              value={stats.pendingApproval}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Đã phê duyệt</span>}
              value={stats.approvedBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Tổng doanh thu</span>}
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? '20px' : '24px' }}
              formatter={(value) => `${value?.toLocaleString('vi-VN')} đ`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Tổng chi nhánh</span>}
              value={stats.totalBranches}
              prefix={<HomeOutlined />}
              valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card bodyStyle={{ padding: isMobile ? 12 : 24 }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Tổng phòng</span>}
              value={stats.totalRooms}
              prefix={<HomeOutlined />}
              valueStyle={{ fontSize: isMobile ? '20px' : '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings */}
      <Card 
        title={<span style={{ fontSize: isMobile ? '16px' : '18px' }}>Đặt phòng gần đây</span>}
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: isMobile ? 0 : 24 }}
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
            size="small"
          />
        )}
      </Card>
    </div>
  );
} 