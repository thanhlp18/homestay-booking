"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Tag,
  Typography,
  Select,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { adminApiCall, handleApiResponse } from "@/lib/adminApi";

const { Title } = Typography;
const { Option } = Select;

interface Room {
  id: string;
  name: string;
}

interface TimeSlot {
  id: string;
  time: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roomId: string;
  room?: Room;
}

interface TimeSlotFormData {
  time: string;
  price: number;
  roomId: string;
  isActive: boolean;
}

export default function TimeSlotsPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotRes, roomRes] = await Promise.all([
        adminApiCall("/api/admin/time-slots"),
        adminApiCall("/api/admin/rooms"),
      ]);
      const [slotData, roomData] = await Promise.all([
        handleApiResponse(slotRes),
        handleApiResponse(roomRes),
      ]);
      setTimeSlots(slotData.data || []);
      setRooms(roomData.data || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const checkMobile = () => setIsMobile(window.innerWidth <= 768);

  const handleCreate = () => {
    setEditingTimeSlot(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: TimeSlot) => {
    setEditingTimeSlot(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminApiCall(`/api/admin/time-slots/${id}`, {
        method: "DELETE",
      });
      await handleApiResponse(res);
      message.success("Đã xóa khung giờ");
      fetchData();
    } catch (error) {
      message.error("Lỗi khi xóa khung giờ");
      console.error(error);
    }
  };

  const handleSubmit = async (values: TimeSlotFormData) => {
    try {
      const url = editingTimeSlot
        ? `/api/admin/time-slots/${editingTimeSlot.id}`
        : "/api/admin/time-slots";
      const method = editingTimeSlot ? "PUT" : "POST";

      const res = await adminApiCall(url, {
        method,
        body: JSON.stringify(values),
      });

      await handleApiResponse(res);
      message.success(
        editingTimeSlot ? "Đã cập nhật khung giờ" : "Đã tạo khung giờ"
      );
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Lỗi khi lưu khung giờ");
      console.error(error);
    }
  };

  const columns: ColumnsType<TimeSlot> = [
    {
      title: "Tên khung giờ",
      dataIndex: "time",
      key: "time",
      render: (text, record) => (
        <div>
          <ClockCircleOutlined style={{ color: "#1890ff", marginRight: 6 }} />
          {text}
        </div>
      ),
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <div style={{ fontWeight: "bold", color: "#52c41a" }}>
          {price.toLocaleString("vi-VN")} đ
        </div>
      ),
    },
    {
      title: "Phòng",
      key: "room",
      render: (_, record) => (
        <div>
          <HomeOutlined style={{ color: "#722ed1", marginRight: 6 }} />
          {record.room?.name || record.roomId}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm ngưng"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa khung giờ này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <Title level={isMobile ? 3 : 2}>Quản lý khung giờ</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size={isMobile ? "middle" : "large"}
        >
          {isMobile ? "Thêm" : "Thêm khung giờ"}
        </Button>
      </div>

      <Card bodyStyle={{ padding: isMobile ? 0 : 24 }}>
        <Table
          columns={columns}
          dataSource={timeSlots}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khung giờ`,
          }}
        />
      </Card>

      <Modal
        title={editingTimeSlot ? "Sửa khung giờ" : "Thêm khung giờ mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={isMobile ? "95%" : 600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="time"
            label="Tên khung giờ"
            rules={[{ required: true, message: "Vui lòng nhập tên khung giờ" }]}
          >
            <Input placeholder="VD: 2 giờ, 3 giờ + 1 giờ, Qua đêm (14h-12h)" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="roomId"
            label="Phòng áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
          >
            <Select placeholder="Chọn phòng">
              {rooms.map((r) => (
                <Option key={r.id} value={r.id}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTimeSlot ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
