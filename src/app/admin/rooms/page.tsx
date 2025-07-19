'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  Upload, 
  message, 
  Popconfirm,
  Tag,
  Typography,
  Select,
  InputNumber
} from 'antd';
import { adminApiCall, handleApiResponse } from '@/lib/adminApi';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  amenities: string[];
  images: string[];
  basePrice: number;
  discountPrice?: number;
  originalPrice?: number;
  location: string;
  area: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  policies: string[];
  checkIn: string;
  checkOut: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branch: {
    id: string;
    name: string;
    location: string;
  };
  _count?: {
    timeSlots: number;
  };
}

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface RoomFormData {
  name: string;
  description: string;
  amenities: string;
  features: string;
  policies: string;
  basePrice: number;
  discountPrice?: number;
  originalPrice?: number;
  location: string;
  area: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  checkIn: string;
  checkOut: string;
  branchId: string;
  isActive: boolean;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch rooms
      const roomsResponse = await adminApiCall('/api/admin/rooms');
      const roomsData = await handleApiResponse(roomsResponse);
      setRooms(roomsData.data || []);

      // Fetch branches
      const branchesResponse = await fetch('/api/branches');
      const branchesData = await branchesResponse.json();
      setBranches(branchesData.data || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setEditingRoom(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setModalVisible(true);
    form.setFieldsValue({
      ...room,
      amenities: room.amenities.join(', '),
      features: room.features.join(', '),
      policies: room.policies.join(', '),
    });
    
    // Set file list for existing images
    const files: UploadFile[] = room.images.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done',
      url,
    }));
    setFileList(files);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await adminApiCall(`/api/admin/rooms/${id}`, {
        method: 'DELETE',
      });

      await handleApiResponse(response);
      message.success('Đã xóa phòng thành công');
      fetchData();
    } catch (error) {
      message.error('Không thể xóa phòng');
      console.error('Error deleting room:', error);
    }
  };

  const handleSubmit = async (values: RoomFormData) => {
    try {
      const formData = {
        ...values,
        amenities: values.amenities.split(',').map(item => item.trim()).filter(Boolean),
        features: values.features.split(',').map(item => item.trim()).filter(Boolean),
        policies: values.policies.split(',').map(item => item.trim()).filter(Boolean),
        images: fileList.map(file => file.url || file.response?.url).filter(Boolean),
      };

      const url = editingRoom 
        ? `/api/admin/rooms/${editingRoom.id}`
        : '/api/admin/rooms';
      
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await adminApiCall(url, {
        method,
        body: JSON.stringify(formData),
      });

      await handleApiResponse(response);
      message.success(
        editingRoom 
          ? 'Đã cập nhật phòng thành công'
          : 'Đã tạo phòng thành công'
      );
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Đã xảy ra lỗi khi lưu phòng');
      console.error('Error saving room:', error);
    }
  };

  const columns: ColumnsType<Room> = [
    {
      title: 'Tên phòng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.location}</div>
        </div>
      ),
    },
    {
      title: 'Chi nhánh',
      key: 'branch',
      render: (_, record) => (
        <div>
          <div>{record.branch.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.branch.location}</div>
        </div>
      ),
    },
    {
      title: 'Giá cơ bản',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price) => `${price.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Giảm giá',
      key: 'discount',
      render: (_, record) => {
        if (record.discountPrice && record.discountPrice < record.basePrice) {
          const discount = record.basePrice - record.discountPrice;
          const percentage = ((discount / record.basePrice) * 100).toFixed(0);
          return (
            <div>
              <div style={{ color: '#52c41a' }}>{record.discountPrice.toLocaleString('vi-VN')} đ</div>
              <div style={{ fontSize: '12px', color: '#666' }}>-{percentage}%</div>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: 'Thông tin',
      key: 'info',
      render: (_, record) => (
        <div>
          <div>{record.capacity} khách • {record.bedrooms} phòng ngủ</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.area} • {record.bathrooms} phòng tắm</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phòng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Quản lý phòng</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Thêm phòng
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} phòng`,
          }}
        />
      </Card>

      <Modal
        title={editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Tên phòng"
              rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="branchId"
              label="Chi nhánh"
              rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
            >
              <Select placeholder="Chọn chi nhánh">
                {branches.map(branch => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.location}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="location"
              label="Vị trí"
              rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="area"
              label="Diện tích"
              rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
            >
              <Input placeholder="VD: 25m²" />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Sức chứa"
              rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
            >
              <InputNumber min={1} max={20} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="bedrooms"
              label="Số phòng ngủ"
              rules={[{ required: true, message: 'Vui lòng nhập số phòng ngủ' }]}
            >
              <InputNumber min={0} max={10} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="bathrooms"
              label="Số phòng tắm"
              rules={[{ required: true, message: 'Vui lòng nhập số phòng tắm' }]}
            >
              <InputNumber min={0} max={10} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="basePrice"
              label="Giá cơ bản (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập giá cơ bản' }]}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
              />
            </Form.Item>

            <Form.Item
              name="discountPrice"
              label="Giá khuyến mãi (VNĐ)"
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
              />
            </Form.Item>

            <Form.Item
              name="checkIn"
              label="Giờ check-in"
              rules={[{ required: true, message: 'Vui lòng nhập giờ check-in' }]}
            >
              <Input placeholder="VD: 14:00" />
            </Form.Item>

            <Form.Item
              name="checkOut"
              label="Giờ check-out"
              rules={[{ required: true, message: 'Vui lòng nhập giờ check-out' }]}
            >
              <Input placeholder="VD: 12:00" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="amenities"
            label="Tiện ích (phân cách bằng dấu phẩy)"
          >
            <Input placeholder="WiFi, Tủ lạnh, Điều hòa, ..." />
          </Form.Item>

          <Form.Item
            name="features"
            label="Tính năng (phân cách bằng dấu phẩy)"
          >
            <Input placeholder="Ban công, View đẹp, Yên tĩnh, ..." />
          </Form.Item>

          <Form.Item
            name="policies"
            label="Chính sách (phân cách bằng dấu phẩy)"
          >
            <Input placeholder="Không hút thuốc, Không thú cưng, ..." />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRoom ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 