'use client';

import { useEffect, useState } from 'react';
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
  Statistic
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';


const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

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
  guestSurcharge: number;
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
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: null as unknown as [any, any] | null,
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      let url = '/api/bookings?limit=100';
      
      if (filters.status) {
        url += `&status=${filters.status}`;
      }
      
      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange;
        url += `&startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      const bookingsList = data.data || [];
      setBookings(bookingsList);

      // Calculate stats
      const total = bookingsList.length;
      const pending = bookingsList.filter((b: BookingRecord) => b.status === 'PENDING').length;
      const paymentConfirmed = bookingsList.filter((b: BookingRecord) => b.status === 'PAYMENT_CONFIRMED').length;
      const approved = bookingsList.filter((b: BookingRecord) => b.status === 'APPROVED').length;
      const rejected = bookingsList.filter((b: BookingRecord) => b.status === 'REJECTED').length;
      const cancelled = bookingsList.filter((b: BookingRecord) => b.status === 'CANCELLED').length;
      const totalRevenue = bookingsList
        .filter((b: BookingRecord) => b.status === 'APPROVED')
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
      message.error('Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const handleViewDetails = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

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
        message.success('Đã phê duyệt đặt phòng thành công');
        await fetchBookings();
      } else {
        message.error('Không thể phê duyệt đặt phòng');
      }
    } catch {
      message.error('Đã xảy ra lỗi khi phê duyệt đặt phòng');
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
        message.success('Đã từ chối đặt phòng thành công');
        await fetchBookings();
      } else {
        message.error('Không thể từ chối đặt phòng');
      }
    } catch {
      message.error('Đã xảy ra lỗi khi từ chối đặt phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Đã hủy đặt phòng thành công');
        await fetchBookings();
      } else {
        message.error('Không thể hủy đặt phòng');
      }
    } catch {
      message.error('Đã xảy ra lỗi khi hủy đặt phòng');
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
        return <Tag icon={<CloseCircleOutlined />} color="red">Đã từ chối</Tag>;
      case 'CANCELLED':
        return <Tag icon={<CloseCircleOutlined />} color="red">Đã hủy</Tag>;
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
          {record.email && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Phòng & Chi nhánh',
      key: 'room',
      render: (_, record) => (
        <div>
          <div>{record.bookingSlots[0]?.room.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.bookingSlots[0]?.room.branch.name} - {record.bookingSlots[0]?.room.branch.location}
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
      title: 'Thông tin',
      key: 'info',
      render: (_, record) => (
        <div>
          <div>{record.guests} khách</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.paymentMethod === 'CASH' ? 'Tiền mặt' : 
             record.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}
          </div>
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
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
          {record.status !== 'CANCELLED' && (
            <Popconfirm
              title="Bạn có chắc chắn muốn hủy đặt phòng này?"
              onConfirm={() => handleCancelBooking(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                danger
                size="small"
                loading={actionLoading === record.id}
              >
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý đặt phòng</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đặt phòng"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ thanh toán"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ phê duyệt"
              value={stats.paymentConfirmed}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã phê duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã từ chối"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
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

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: 8 }}>Trạng thái:</span>
            <Select
              style={{ width: 150 }}
              placeholder="Tất cả"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
            >
              <Option value="PENDING">Chờ thanh toán</Option>
              <Option value="PAYMENT_CONFIRMED">Chờ phê duyệt</Option>
              <Option value="APPROVED">Đã phê duyệt</Option>
              <Option value="REJECTED">Đã từ chối</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col>
            <span style={{ marginRight: 8 }}>Khoảng thời gian:</span>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Bookings Table */}
      <Card>
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
      </Card>

      {/* Booking Detail Modal */}
      <Modal
        title="Chi tiết đặt phòng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedBooking && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Mã đặt phòng" span={2}>
              {selectedBooking.id}
            </Descriptions.Item>
            <Descriptions.Item label="Họ tên">
              {selectedBooking.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedBooking.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedBooking.email || 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="CCCD">
              {selectedBooking.cccd}
            </Descriptions.Item>
            <Descriptions.Item label="Số khách">
              {selectedBooking.guests} người
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedBooking.paymentMethod === 'CASH' ? 'Tiền mặt' : 
               selectedBooking.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              {getStatusTag(selectedBooking.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Phòng" span={2}>
              {selectedBooking.bookingSlots[0]?.room.name} - {selectedBooking.bookingSlots[0]?.room.branch.name}
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh" span={2}>
              {selectedBooking.bookingSlots[0]?.room.branch.location}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt" span={2}>
              {selectedBooking.bookingSlots.map(slot => {
                const date = new Date(slot.bookingDate).toLocaleDateString('vi-VN');
                return `${date} - ${slot.timeSlot.time}`;
              }).join(', ')}
            </Descriptions.Item>
            <Descriptions.Item label="Giá cơ bản">
              {selectedBooking.basePrice.toLocaleString('vi-VN')} đ
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              {selectedBooking.discountAmount.toLocaleString('vi-VN')} đ ({selectedBooking.discountPercentage * 100}%)
            </Descriptions.Item>
            <Descriptions.Item label="Phụ phí khách">
              {selectedBooking.guestSurcharge.toLocaleString('vi-VN')} đ
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <strong>{selectedBooking.totalPrice.toLocaleString('vi-VN')} đ</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {selectedBooking.notes || 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú admin" span={2}>
              {selectedBooking.adminNotes || 'Không có'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {new Date(selectedBooking.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {selectedBooking.approvedAt && (
              <Descriptions.Item label="Ngày phê duyệt">
                {new Date(selectedBooking.approvedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
            {selectedBooking.rejectedAt && (
              <Descriptions.Item label="Ngày từ chối">
                {new Date(selectedBooking.rejectedAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
} 