'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Spin } from 'antd';
import { 
  BookOutlined, 
  HomeOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
        }),
      });

      if (response.ok) {
        await fetchData();
      }
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
        <Space>
          {(record.status === 'PENDING' || record.status === 'PAYMENT_CONFIRMED') && (
            <>
              <Button
                type="primary"
                size="small"
                loading={actionLoading === record.id}
                onClick={() => handleApproveBooking(record.id)}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                size="small"
                loading={actionLoading === record.id}
                onClick={() => handleRejectBooking(record.id)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đặt phòng"
              value={stats.totalBookings}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ phê duyệt"
              value={stats.pendingApproval}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã phê duyệt"
              value={stats.approvedBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${value?.toLocaleString('vi-VN')} đ`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng chi nhánh"
              value={stats.totalBranches}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng phòng"
              value={stats.totalRooms}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings Table */}
      <Card title="Đặt phòng gần đây" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={bookings.slice(0, 10)}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
} 