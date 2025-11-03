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
  floor?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  price: number;
  duration: number | null;
  isOvernight: boolean;
  weekendSurcharge: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roomId: string;
  room?: Room;
}

interface TimeSlotFormData {
  time: string;
  price: number;
  duration?: number | null;
  isOvernight: boolean;
  weekendSurcharge: number;
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
    // Đảm bảo form hiển thị đúng giá trị, đặc biệt cho weekendSurcharge
    form.setFieldsValue({
      ...record,
      weekendSurcharge: record.weekendSurcharge || 0,
    });
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
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <ClockCircleOutlined style={{ color: "#bd8049", marginRight: 6 }} />
            <strong>{text}</strong>
          </div>
          <div>
            {record.isOvernight ? (
              <Tag color="#83311b" style={{ color: "#fff" }}>Qua đêm</Tag>
            ) : record.duration ? (
              <Tag color="#605f3a" style={{ color: "#fff" }}>{record.duration} giờ</Tag>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 180,
      render: (price, record) => (
        <div>
          <div style={{ fontWeight: "bold", color: "#605f3a" }}>
            {price.toLocaleString("vi-VN")} đ
          </div>
          {record.weekendSurcharge > 0 && (
            <div style={{ fontSize: 12, color: "#bd8049", marginTop: 4 }}>
              T7&CN: +{record.weekendSurcharge.toLocaleString("vi-VN")} đ
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Phòng",
      key: "room",
      width: 150,
      render: (_, record) => (
        <div>
          <HomeOutlined style={{ color: "#bd8049", marginRight: 6 }} />
          {record.room?.name || record.roomId}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? "#605f3a" : "#83311b"} style={{ color: "#fff" }}>
          {isActive ? "Hoạt động" : "Tạm ngưng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
          >
            {!isMobile && "Sửa"}
          </Button>
          <Popconfirm
            title="Xóa khung giờ này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              {!isMobile && "Xóa"}
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
        <Title level={isMobile ? 3 : 2} style={{ color: '#83311b' }}>Quản lý khung giờ</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size={isMobile ? "middle" : "large"}
        >
          {isMobile ? "Thêm" : "Thêm khung giờ"}
        </Button>
      </div>

      <Card 
        bodyStyle={{ padding: isMobile ? 0 : 24 }}
        style={{
          border: '1px solid #fbe0a2',
          boxShadow: '0 4px 12px rgba(189, 128, 73, 0.1)',
          borderRadius: 12,
          background: '#ffffff'
        }}
      >
        <Table
          columns={columns}
          dataSource={timeSlots}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: !isMobile,
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
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          initialValues={{ isActive: true, isOvernight: false, weekendSurcharge: 0 }}
        >
          <Form.Item
            name="time"
            label="Tên khung giờ"
            rules={[
              { required: true, message: "Vui lòng nhập tên khung giờ" },
              { min: 2, message: "Tên khung giờ phải có ít nhất 2 ký tự" },
            ]}
            tooltip="Tên hiển thị cho khách hàng"
          >
            <Input 
              placeholder="VD: 2 giờ, Qua đêm (14h–12h)" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="roomId"
            label="Phòng áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
            tooltip="Chọn phòng sẽ áp dụng khung giờ này"
          >
            <Select 
              placeholder="Chọn phòng" 
              showSearch 
              optionFilterProp="children"
              size="large"
            >
              {rooms.map((r) => (
                <Option key={r.id} value={r.id}>
                  <HomeOutlined style={{ marginRight: 8 }} />
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ 
            background: '#ffefd9', 
            padding: 16, 
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #fbe0a2'
          }}>
            <Form.Item
              name="isOvernight"
              label={<strong style={{ color: '#83311b' }}>Loại gói</strong>}
              valuePropName="checked"
              style={{ marginBottom: 12 }}
            >
              <Switch 
                checkedChildren={<span>🌙 Qua đêm</span>}
                unCheckedChildren={<span>⏰ Theo giờ</span>}
                onChange={(checked) => {
                  if (checked) {
                    form.setFieldsValue({ duration: null });
                  } else {
                    form.setFieldsValue({ duration: 2 });
                  }
                }}
              />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
              prevValues.isOvernight !== currentValues.isOvernight
            }>
              {({ getFieldValue }) => {
                const isOvernight = getFieldValue('isOvernight');
                return !isOvernight ? (
                  <Form.Item
                    name="duration"
                    label="Thời lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập thời lượng" },
                      { type: "number", min: 1, max: 12, message: "Thời lượng từ 1-12 giờ" },
                    ]}
                    extra="Số giờ khách có thể sử dụng phòng"
                  >
                    <InputNumber
                      min={1}
                      max={12}
                      style={{ width: "100%" }}
                      placeholder="Nhập số giờ (VD: 2, 3)"
                      addonAfter="giờ"
                      size="large"
                    />
                  </Form.Item>
                ) : (
                  <div style={{ 
                    padding: 12, 
                    background: '#fff', 
                    borderRadius: 6,
                    color: '#605f3a',
                    border: '1px solid #fbe0a2'
                  }}>
                    ℹ️ Gói qua đêm không giới hạn thời gian cụ thể
                  </div>
                );
              }}
            </Form.Item>
          </div>

          <Form.Item
            name="price"
            label={<strong>Giá cơ bản</strong>}
            rules={[
              { required: true, message: "Vui lòng nhập giá" },
              {
                type: "number",
                min: 1000,
                message: "Giá phải lớn hơn 1,000 VNĐ",
              },
            ]}
            extra="Giá áp dụng cho các ngày thường (T2-T6)"
          >
            <InputNumber
              min={1000}
              step={10000}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value!.replace(/,/g, "")) as any}
              placeholder="Nhập giá (VD: 200,000)"
              addonAfter="VNĐ"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="weekendSurcharge"
            label="Phụ phí cuối tuần"
            rules={[
              { required: true, message: "Vui lòng nhập phụ phí cuối tuần" },
              { type: "number", min: 0, message: "Phụ phí phải lớn hơn hoặc bằng 0" },
            ]}
            tooltip="Phụ phí sẽ được cộng thêm vào giá cơ bản cho thứ 7 và chủ nhật"
            extra="Nhập 0 nếu giá cuối tuần giống ngày thường"
          >
            <InputNumber
              min={0}
              step={10000}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value!.replace(/,/g, "")) as any}
              placeholder="Nhập phụ phí (VD: 50,000 hoặc 0)"
              addonAfter="VNĐ"
              size="large"
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.price !== currentValues.price || 
            prevValues.weekendSurcharge !== currentValues.weekendSurcharge
          }>
            {({ getFieldValue }) => {
              const price = getFieldValue('price') || 0;
              const surcharge = getFieldValue('weekendSurcharge') || 0;
              const weekendPrice = price + surcharge;
              
              return surcharge > 0 ? (
                <div style={{ 
                  padding: 12, 
                  background: '#ffefd9', 
                  borderRadius: 6,
                  marginBottom: 16,
                  border: '1px solid #fbe0a2'
                }}>
                  <div style={{ marginBottom: 4, color: '#83311b' }}>
                    📅 <strong>Giá cuối tuần:</strong> {weekendPrice.toLocaleString("vi-VN")} đ
                  </div>
                  <div style={{ fontSize: 12, color: '#605f3a' }}>
                    = Giá cơ bản ({price.toLocaleString("vi-VN")} đ) + Phụ phí ({surcharge.toLocaleString("vi-VN")} đ)
                  </div>
                </div>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Bật" 
              unCheckedChildren="Tắt"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)} size="large">
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                {editingTimeSlot ? "💾 Cập nhật" : "✨ Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
