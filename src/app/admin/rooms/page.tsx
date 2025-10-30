// "use client";

// import { useEffect, useState } from "react";
// import {
//   Card,
//   Table,
//   Button,
//   Space,
//   Modal,
//   Form,
//   Input,
//   Switch,
//   message,
//   Popconfirm,
//   Tag,
//   Typography,
//   Select,
//   InputNumber,
//   Avatar,
// } from "antd";
// import { adminApiCall, handleApiResponse } from "@/lib/adminApi";
// import S3ImageUpload from "../components/S3ImageUpload";
// import { ImageGallery } from "../components/ImageDisplay";
// import {
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   HomeOutlined,
//   EnvironmentOutlined,
//   UserOutlined,
//   DollarOutlined,
// } from "@ant-design/icons";
// import type { ColumnsType } from "antd/es/table";
// import RoomTimeSlots from "../components/RoomTimeSlots";

// const { Title, Text } = Typography;
// const { TextArea } = Input;
// const { Option } = Select;

// interface Room {
//   id: string;
//   name: string;
//   slug: string;
//   description: string;
//   amenities: string[];
//   images: string[];
//   basePrice: number;
//   discountPrice?: number;
//   originalPrice?: number;
//   location: string;
//   area: string;
//   capacity: number;
//   bedrooms: number;
//   bathrooms: number;
//   features: string[];
//   policies: string[];
//   checkIn: string;
//   checkOut: string;
//   rating: number;
//   reviewCount: number;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
//   branch: {
//     id: string;
//     name: string;
//     location: string;
//   };
//   _count?: {
//     timeSlots: number;
//   };
// }

// interface Branch {
//   id: string;
//   name: string;
//   location: string;
// }

// interface RoomFormData {
//   name: string;
//   description: string;
//   amenities: string;
//   features: string;
//   policies: string;
//   basePrice: number;
//   discountPrice?: number;
//   originalPrice?: number;
//   location: string;
//   area: string;
//   capacity: number;
//   bedrooms: number;
//   bathrooms: number;
//   checkIn: string;
//   checkOut: string;
//   branchId: string;
//   isActive: boolean;
// }

// export default function RoomsPage() {
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingRoom, setEditingRoom] = useState<Room | null>(null);
//   const [form] = Form.useForm();
//   const [isMobile, setIsMobile] = useState(false);
//   const [imageUrls, setImageUrls] = useState<string[]>([]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       // Fetch rooms
//       const roomsResponse = await adminApiCall("/api/admin/rooms");
//       const roomsData = await handleApiResponse(roomsResponse);
//       setRooms(roomsData.data || []);

//       // Fetch branches
//       const branchesResponse = await fetch("/api/branches");
//       const branchesData = await branchesResponse.json();
//       setBranches(branchesData.data || []);
//     } catch (error) {
//       message.error("Không thể tải dữ liệu");
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     checkMobile();

//     const handleResize = () => {
//       checkMobile();
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const checkMobile = () => {
//     setIsMobile(window.innerWidth <= 768);
//   };

//   const handleCreate = () => {
//     setEditingRoom(null);
//     setModalVisible(true);
//     form.resetFields();
//     setImageUrls([]);
//   };

//   const handleEdit = (room: Room) => {
//     setEditingRoom(room);
//     setModalVisible(true);
//     form.setFieldsValue({
//       ...room,
//       amenities: room.amenities.join(", "),
//       features: room.features.join(", "),
//       policies: room.policies.join(", "),
//     });

//     // Set existing images
//     setImageUrls(room.images || []);
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       const response = await adminApiCall(`/api/admin/rooms/${id}`, {
//         method: "DELETE",
//       });

//       await handleApiResponse(response);
//       message.success("Đã xóa phòng thành công");
//       fetchData();
//     } catch (error) {
//       message.error("Không thể xóa phòng");
//       console.error("Error deleting room:", error);
//     }
//   };

//   const handleSubmit = async (values: RoomFormData) => {
//     try {
//       const formData = {
//         ...values,
//         amenities: values.amenities
//           .split(",")
//           .map((item) => item.trim())
//           .filter(Boolean),
//         features: values.features
//           .split(",")
//           .map((item) => item.trim())
//           .filter(Boolean),
//         policies: values.policies
//           .split(",")
//           .map((item) => item.trim())
//           .filter(Boolean),
//         images: imageUrls,
//       };

//       const url = editingRoom
//         ? `/api/admin/rooms/${editingRoom.id}`
//         : "/api/admin/rooms";

//       const method = editingRoom ? "PUT" : "POST";

//       const response = await adminApiCall(url, {
//         method,
//         body: JSON.stringify(formData),
//       });

//       await handleApiResponse(response);
//       message.success(
//         editingRoom ? "Đã cập nhật phòng thành công" : "Đã tạo phòng thành công"
//       );
//       setModalVisible(false);
//       fetchData();
//     } catch (error) {
//       message.error("Đã xảy ra lỗi khi lưu phòng");
//       console.error("Error saving room:", error);
//     }
//   };

//   const renderMobileRoomCard = (room: Room) => (
//     <Card
//       key={room.id}
//       style={{
//         marginBottom: 16,
//         borderRadius: 12,
//         boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//         border: "1px solid #f0f0f0",
//       }}
//       bodyStyle={{ padding: 16 }}
//     >
//       <div
//         style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}
//       >
//         <Avatar
//           icon={<HomeOutlined />}
//           size={48}
//           style={{
//             marginRight: 12,
//             backgroundColor: room.isActive ? "#52c41a" : "#ff4d4f",
//             flexShrink: 0,
//           }}
//         />
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div
//             style={{
//               fontWeight: "bold",
//               fontSize: "16px",
//               marginBottom: 4,
//               wordBreak: "break-word",
//             }}
//           >
//             {room.name}
//           </div>
//           <div
//             style={{
//               color: "#666",
//               fontSize: "14px",
//               display: "flex",
//               alignItems: "center",
//               marginBottom: 4,
//             }}
//           >
//             <EnvironmentOutlined style={{ marginRight: 4, flexShrink: 0 }} />
//             <span style={{ wordBreak: "break-word" }}>{room.location}</span>
//           </div>
//           <Tag color={room.isActive ? "green" : "red"} style={{ margin: 0 }}>
//             {room.isActive ? "Hoạt động" : "Không hoạt động"}
//           </Tag>
//         </div>
//       </div>

//       <div
//         style={{
//           marginBottom: 16,
//           background: "#fafafa",
//           padding: 12,
//           borderRadius: 8,
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
//           <HomeOutlined
//             style={{ marginRight: 8, color: "#1890ff", flexShrink: 0 }}
//           />
//           <Text style={{ fontSize: "14px" }}>
//             {room.branch.name} - {room.branch.location}
//           </Text>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
//           <UserOutlined
//             style={{ marginRight: 8, color: "#52c41a", flexShrink: 0 }}
//           />
//           <Text style={{ fontSize: "14px" }}>
//             {room.capacity} khách • {room.bedrooms} phòng ngủ • {room.bathrooms}{" "}
//             phòng tắm
//           </Text>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
//           <DollarOutlined
//             style={{ marginRight: 8, color: "#faad14", flexShrink: 0 }}
//           />
//           <div>
//             <Text
//               style={{ fontSize: "14px", fontWeight: "bold", color: "#52c41a" }}
//             >
//               {room.basePrice.toLocaleString("vi-VN")} đ
//             </Text>
//             {room.discountPrice && room.discountPrice < room.basePrice && (
//               <div style={{ fontSize: "12px", color: "#666" }}>
//                 Giảm giá: {room.discountPrice.toLocaleString("vi-VN")} đ (
//                 {(
//                   ((room.basePrice - room.discountPrice) / room.basePrice) *
//                   100
//                 ).toFixed(0)}
//                 % off)
//               </div>
//             )}
//           </div>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
//           <EnvironmentOutlined
//             style={{ marginRight: 8, color: "#722ed1", flexShrink: 0 }}
//           />
//           <Text style={{ fontSize: "14px" }}>{room.area}</Text>
//         </div>

//         {/* Display images if available */}
//         {room.images && room.images.length > 0 && (
//           <div style={{ marginTop: 12 }}>
//             <Text
//               style={{
//                 fontSize: "12px",
//                 color: "#666",
//                 marginBottom: 8,
//                 display: "block",
//               }}
//             >
//               Hình ảnh ({room.images.length})
//             </Text>
//             <ImageGallery images={room.images} size="small" maxDisplay={3} />
//           </div>
//         )}
//       </div>

//       <div style={{ display: "flex", gap: 8 }}>
//         <Button
//           type="primary"
//           size="middle"
//           icon={<EditOutlined />}
//           onClick={() => handleEdit(room)}
//           style={{
//             flex: 1,
//             height: 44,
//             fontSize: "14px",
//             fontWeight: "bold",
//             borderRadius: 8,
//           }}
//         >
//           Sửa
//         </Button>
//         <Popconfirm
//           title="Bạn có chắc chắn muốn xóa phòng này?"
//           onConfirm={() => handleDelete(room.id)}
//           okText="Có"
//           cancelText="Không"
//           placement="topRight"
//         >
//           <Button
//             danger
//             size="middle"
//             icon={<DeleteOutlined />}
//             style={{
//               flex: 1,
//               height: 44,
//               fontSize: "14px",
//               fontWeight: "bold",
//               borderRadius: 8,
//             }}
//           >
//             Xóa
//           </Button>
//         </Popconfirm>
//       </div>
//     </Card>
//   );

//   const columns: ColumnsType<Room> = [
//     {
//       title: "Tên phòng",
//       dataIndex: "name",
//       key: "name",
//       render: (text, record) => (
//         <div>
//           <div style={{ fontWeight: "bold" }}>{text}</div>
//           <div style={{ fontSize: "12px", color: "#666" }}>
//             {record.location}
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Chi nhánh",
//       key: "branch",
//       render: (_, record) => (
//         <div>
//           <div>{record.branch.name}</div>
//           <div style={{ fontSize: "12px", color: "#666" }}>
//             {record.branch.location}
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Giá cơ bản",
//       dataIndex: "basePrice",
//       key: "basePrice",
//       render: (price) => `${price.toLocaleString("vi-VN")} đ`,
//     },
//     {
//       title: "Giảm giá",
//       key: "discount",
//       render: (_, record) => {
//         if (record.discountPrice && record.discountPrice < record.basePrice) {
//           const discount = record.basePrice - record.discountPrice;
//           const percentage = ((discount / record.basePrice) * 100).toFixed(0);
//           return (
//             <div>
//               <div style={{ color: "#52c41a" }}>
//                 {record.discountPrice.toLocaleString("vi-VN")} đ
//               </div>
//               <div style={{ fontSize: "12px", color: "#666" }}>
//                 -{percentage}%
//               </div>
//             </div>
//           );
//         }
//         return "-";
//       },
//     },
//     {
//       title: "Thông tin",
//       key: "info",
//       render: (_, record) => (
//         <div>
//           <div>
//             {record.capacity} khách • {record.bedrooms} phòng ngủ
//           </div>
//           <div style={{ fontSize: "12px", color: "#666" }}>
//             {record.area} • {record.bathrooms} phòng tắm
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Trạng thái",
//       dataIndex: "isActive",
//       key: "isActive",
//       render: (isActive) => (
//         <Tag color={isActive ? "green" : "red"}>
//           {isActive ? "Hoạt động" : "Không hoạt động"}
//         </Tag>
//       ),
//     },
//     {
//       title: "Thao tác",
//       key: "actions",
//       render: (_, record) => (
//         <Space>
//           <Button
//             type="primary"
//             icon={<EditOutlined />}
//             size="small"
//             onClick={() => handleEdit(record)}
//           >
//             Sửa
//           </Button>
//           <Popconfirm
//             title="Bạn có chắc chắn muốn xóa phòng này?"
//             onConfirm={() => handleDelete(record.id)}
//             okText="Có"
//             cancelText="Không"
//           >
//             <Button danger icon={<DeleteOutlined />} size="small">
//               Xóa
//             </Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: isMobile ? 16 : 24,
//         }}
//       >
//         <Title level={isMobile ? 3 : 2}>Quản lý phòng</Title>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={handleCreate}
//           size={isMobile ? "middle" : "large"}
//         >
//           {isMobile ? "Thêm" : "Thêm phòng"}
//         </Button>
//       </div>

//       <Card bodyStyle={{ padding: isMobile ? 0 : 24 }}>
//         {isMobile ? (
//           <div style={{ padding: isMobile ? 16 : 0 }}>
//             {rooms.map(renderMobileRoomCard)}
//           </div>
//         ) : (
//           <Table
//             columns={columns}
//             dataSource={rooms}
//             rowKey="id"
//             loading={loading}
//             pagination={{
//               pageSize: 10,
//               showSizeChanger: true,
//               showQuickJumper: true,
//               showTotal: (total, range) =>
//                 `${range[0]}-${range[1]} của ${total} phòng`,
//             }}
//             scroll={{ x: 1000 }}
//           />
//         )}
//       </Card>

//       <Modal
//         title={editingRoom ? "Sửa phòng" : "Thêm phòng mới"}
//         open={modalVisible}
//         onCancel={() => setModalVisible(false)}
//         footer={null}
//         width={isMobile ? "95%" : 900}
//         bodyStyle={{ maxHeight: isMobile ? "70vh" : "auto", overflow: "auto" }}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSubmit}>
//           <div
//             style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
//           >
//             <Form.Item
//               name="name"
//               label="Tên phòng"
//               rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
//             >
//               <Input />
//             </Form.Item>

//             <Form.Item
//               name="branchId"
//               label="Chi nhánh"
//               rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
//             >
//               <Select placeholder="Chọn chi nhánh">
//                 {branches.map((branch) => (
//                   <Option key={branch.id} value={branch.id}>
//                     {branch.name} - {branch.location}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>

//             <Form.Item
//               name="location"
//               label="Vị trí"
//               rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
//             >
//               <Input />
//             </Form.Item>

//             <Form.Item
//               name="area"
//               label="Diện tích"
//               rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
//             >
//               <Input placeholder="VD: 25m²" />
//             </Form.Item>

//             <Form.Item
//               name="capacity"
//               label="Sức chứa"
//               rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
//             >
//               <InputNumber min={1} max={20} style={{ width: "100%" }} />
//             </Form.Item>

//             <Form.Item
//               name="bedrooms"
//               label="Số phòng ngủ"
//               rules={[
//                 { required: true, message: "Vui lòng nhập số phòng ngủ" },
//               ]}
//             >
//               <InputNumber min={0} max={10} style={{ width: "100%" }} />
//             </Form.Item>

//             <Form.Item
//               name="bathrooms"
//               label="Số phòng tắm"
//               rules={[
//                 { required: true, message: "Vui lòng nhập số phòng tắm" },
//               ]}
//             >
//               <InputNumber min={0} max={10} style={{ width: "100%" }} />
//             </Form.Item>

//             <Form.Item
//               name="basePrice"
//               label="Giá cơ bản (VNĐ)"
//               rules={[{ required: true, message: "Vui lòng nhập giá cơ bản" }]}
//             >
//               <InputNumber min={0} style={{ width: "100%" }} />
//             </Form.Item>

//             <Form.Item name="discountPrice" label="Giá khuyến mãi (VNĐ)">
//               <InputNumber min={0} style={{ width: "100%" }} />
//             </Form.Item>

//             <Form.Item
//               name="checkIn"
//               label="Giờ check-in"
//               rules={[
//                 { required: true, message: "Vui lòng nhập giờ check-in" },
//               ]}
//             >
//               <Input placeholder="VD: 14:00" />
//             </Form.Item>

//             <Form.Item
//               name="checkOut"
//               label="Giờ check-out"
//               rules={[
//                 { required: true, message: "Vui lòng nhập giờ check-out" },
//               ]}
//             >
//               <Input placeholder="VD: 12:00" />
//             </Form.Item>
//           </div>

//           <Form.Item
//             name="description"
//             label="Mô tả"
//             rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
//           >
//             <TextArea rows={3} />
//           </Form.Item>

//           <Form.Item
//             name="amenities"
//             label="Tiện ích (phân cách bằng dấu phẩy)"
//           >
//             <Input placeholder="WiFi, Tủ lạnh, Điều hòa, ..." />
//           </Form.Item>

//           <Form.Item
//             name="features"
//             label="Tính năng (phân cách bằng dấu phẩy)"
//           >
//             <Input placeholder="Ban công, View đẹp, Yên tĩnh, ..." />
//           </Form.Item>

//           <Form.Item
//             name="policies"
//             label="Chính sách (phân cách bằng dấu phẩy)"
//           >
//             <Input placeholder="Không hút thuốc, Không thú cưng, ..." />
//           </Form.Item>

//           <Form.Item
//             name="isActive"
//             label="Trạng thái"
//             valuePropName="checked"
//             initialValue={true}
//           >
//             <Switch />
//           </Form.Item>

//           <Form.Item label="Hình ảnh">
//             <S3ImageUpload
//               value={imageUrls}
//               onChange={setImageUrls}
//               maxCount={10}
//               folder="rooms"
//             />
//           </Form.Item>

//           <Form.Item>
//             <Space>
//               <Button type="primary" htmlType="submit">
//                 {editingRoom ? "Cập nhật" : "Tạo mới"}
//               </Button>
//               <Button onClick={() => setModalVisible(false)}>Hủy</Button>
//             </Space>
//           </Form.Item>
//         </Form>
//         {editingRoom && (
//           <div style={{ marginTop: 24 }}>
//             <RoomTimeSlots roomId={editingRoom.id} />
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }
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
  Avatar,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { adminApiCall, handleApiResponse } from "@/lib/adminApi";
import S3ImageUpload from "../components/S3ImageUpload";
import { ImageGallery } from "../components/ImageDisplay";
import RoomTimeSlots from "../components/RoomTimeSlots";

const { Title, Text } = Typography;
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

export default function RoomModal() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // ------------------- Fetch data -------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const roomsRes = await adminApiCall("/api/admin/rooms");
      const roomsData = await handleApiResponse(roomsRes);
      setRooms(roomsData.data || []);

      const branchRes = await fetch("/api/branches");
      const branchData = await branchRes.json();
      setBranches(branchData.data || []);
    } catch (err) {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ------------------- CRUD -------------------
  const handleCreate = () => {
    setEditingRoom(null);
    setModalVisible(true);
    form.resetFields();
    setImageUrls([]);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setModalVisible(true);
    form.setFieldsValue({
      ...room,
      amenities: room.amenities.join(", "),
      features: room.features.join(", "),
      policies: room.policies.join(", "),
    });
    setImageUrls(room.images || []);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminApiCall(`/api/admin/rooms/${id}`, {
        method: "DELETE",
      });
      await handleApiResponse(res);
      message.success("Đã xóa phòng");
      fetchData();
    } catch {
      message.error("Không thể xóa phòng");
    }
  };

  const handleSubmit = async (values: RoomFormData) => {
    try {
      const data = {
        ...values,
        amenities: values.amenities
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        features: values.features
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        policies: values.policies
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        images: imageUrls,
      };

      const url = editingRoom
        ? `/api/admin/rooms/${editingRoom.id}`
        : `/api/admin/rooms`;
      const method = editingRoom ? "PUT" : "POST";

      const res = await adminApiCall(url, {
        method,
        body: JSON.stringify(data),
      });
      await handleApiResponse(res);

      message.success(
        editingRoom ? "Cập nhật phòng thành công" : "Tạo phòng thành công"
      );
      setModalVisible(false);
      fetchData();
    } catch (err) {
      message.error("Lỗi khi lưu phòng");
    }
  };
  const renderMobileRoomCard = (room: Room) => (
    <Card
      key={room.id}
      style={{
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid #f0f0f0",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div
        style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}
      >
        <Avatar
          icon={<HomeOutlined />}
          size={48}
          style={{
            marginRight: 12,
            backgroundColor: room.isActive ? "#52c41a" : "#ff4d4f",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: 4,
              wordBreak: "break-word",
            }}
          >
            {room.name}
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <EnvironmentOutlined style={{ marginRight: 4, flexShrink: 0 }} />
            <span style={{ wordBreak: "break-word" }}>{room.location}</span>
          </div>
          <Tag color={room.isActive ? "green" : "red"} style={{ margin: 0 }}>
            {room.isActive ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        </div>
      </div>

      <div
        style={{
          marginBottom: 16,
          background: "#fafafa",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <HomeOutlined
            style={{ marginRight: 8, color: "#1890ff", flexShrink: 0 }}
          />
          <Text style={{ fontSize: "14px" }}>
            {room.branch.name} - {room.branch.location}
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <UserOutlined
            style={{ marginRight: 8, color: "#52c41a", flexShrink: 0 }}
          />
          <Text style={{ fontSize: "14px" }}>
            {room.capacity} khách • {room.bedrooms} phòng ngủ • {room.bathrooms}{" "}
            phòng tắm
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <DollarOutlined
            style={{ marginRight: 8, color: "#faad14", flexShrink: 0 }}
          />
          <div>
            <Text
              style={{ fontSize: "14px", fontWeight: "bold", color: "#52c41a" }}
            >
              {room.basePrice.toLocaleString("vi-VN")} đ
            </Text>
            {room.discountPrice && room.discountPrice < room.basePrice && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                Giảm giá: {room.discountPrice.toLocaleString("vi-VN")} đ (
                {(
                  ((room.basePrice - room.discountPrice) / room.basePrice) *
                  100
                ).toFixed(0)}
                % off)
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <EnvironmentOutlined
            style={{ marginRight: 8, color: "#722ed1", flexShrink: 0 }}
          />
          <Text style={{ fontSize: "14px" }}>{room.area}</Text>
        </div>

        {/* Display images if available */}
        {room.images && room.images.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Text
              style={{
                fontSize: "12px",
                color: "#666",
                marginBottom: 8,
                display: "block",
              }}
            >
              Hình ảnh ({room.images.length})
            </Text>
            <ImageGallery images={room.images} size="small" maxDisplay={3} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Button
          type="primary"
          size="middle"
          icon={<EditOutlined />}
          onClick={() => handleEdit(room)}
          style={{
            flex: 1,
            height: 44,
            fontSize: "14px",
            fontWeight: "bold",
            borderRadius: 8,
          }}
        >
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa phòng này?"
          onConfirm={() => handleDelete(room.id)}
          okText="Có"
          cancelText="Không"
          placement="topRight"
        >
          <Button
            danger
            size="middle"
            icon={<DeleteOutlined />}
            style={{
              flex: 1,
              height: 44,
              fontSize: "14px",
              fontWeight: "bold",
              borderRadius: 8,
            }}
          >
            Xóa
          </Button>
        </Popconfirm>
      </div>
    </Card>
  );
  // ------------------- Table -------------------
  const columns: ColumnsType<Room> = [
    {
      title: "Tên phòng",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.location}
          </div>
        </div>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      render: (_, record) => (
        <div>
          <div>{record.branch.name}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.branch.location}
          </div>
        </div>
      ),
    },
    {
      title: "Giá cơ bản",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price) => `${price.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Giảm giá",
      key: "discount",
      render: (_, record) => {
        if (record.discountPrice && record.discountPrice < record.basePrice) {
          const discount = record.basePrice - record.discountPrice;
          const percentage = ((discount / record.basePrice) * 100).toFixed(0);
          return (
            <div>
              <div style={{ color: "#52c41a" }}>
                {record.discountPrice.toLocaleString("vi-VN")} đ
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                -{percentage}%
              </div>
            </div>
          );
        }
        return "-";
      },
    },
    {
      title: "Thông tin",
      key: "info",
      render: (_, record) => (
        <div>
          <div>
            {record.capacity} khách • {record.bedrooms} phòng ngủ
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.area} • {record.bathrooms} phòng tắm
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
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
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  // ------------------- Form Tabs -------------------
  const formTab = (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Form.Item
          name="name"
          label="Tên phòng"
          rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="branchId"
          label="Chi nhánh"
          rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}
        >
          <Select placeholder="Chọn chi nhánh">
            {branches.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.name} - {branch.location}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="location"
          label="Vị trí"
          rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="area"
          label="Diện tích"
          rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
        >
          <Input placeholder="VD: 25m²" />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Sức chứa"
          rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
        >
          <InputNumber min={1} max={20} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="bedrooms"
          label="Số phòng ngủ"
          rules={[{ required: true, message: "Vui lòng nhập số phòng ngủ" }]}
        >
          <InputNumber min={0} max={10} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="bathrooms"
          label="Số phòng tắm"
          rules={[{ required: true, message: "Vui lòng nhập số phòng tắm" }]}
        >
          <InputNumber min={0} max={10} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="basePrice"
          label="Giá cơ bản (VNĐ)"
          rules={[{ required: true, message: "Vui lòng nhập giá cơ bản" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="discountPrice" label="Giá khuyến mãi (VNĐ)">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="checkIn"
          label="Giờ check-in"
          rules={[{ required: true, message: "Vui lòng nhập giờ check-in" }]}
        >
          <Input placeholder="VD: 14:00" />
        </Form.Item>

        <Form.Item
          name="checkOut"
          label="Giờ check-out"
          rules={[{ required: true, message: "Vui lòng nhập giờ check-out" }]}
        >
          <Input placeholder="VD: 12:00" />
        </Form.Item>
      </div>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
      >
        <TextArea rows={3} />
      </Form.Item>

      <Form.Item name="amenities" label="Tiện ích (phân cách bằng dấu phẩy)">
        <Input placeholder="WiFi, Tủ lạnh, Điều hòa, ..." />
      </Form.Item>

      <Form.Item name="features" label="Tính năng (phân cách bằng dấu phẩy)">
        <Input placeholder="Ban công, View đẹp, Yên tĩnh, ..." />
      </Form.Item>

      <Form.Item name="policies" label="Chính sách (phân cách bằng dấu phẩy)">
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
        <S3ImageUpload
          value={imageUrls}
          onChange={setImageUrls}
          maxCount={10}
          folder="rooms"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {editingRoom ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button onClick={() => setModalVisible(false)}>Hủy</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: "1",
      label: "Thông tin phòng",
      children: formTab,
    },
    {
      key: "2",
      label: "Khung giờ phòng",
      children: (
        <div style={{ marginTop: 12 }}>
          {editingRoom ? (
            <RoomTimeSlots roomId={editingRoom.id} />
          ) : (
            <div className="text-gray-500">
              ⚠️ Bạn cần lưu phòng trước khi thêm khung giờ.
            </div>
          )}
        </div>
      ),
    },
  ];

  // ------------------- Render -------------------
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
        <Title level={isMobile ? 3 : 2}>Quản lý phòng</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size={isMobile ? "middle" : "large"}
        >
          {isMobile ? "Thêm" : "Thêm phòng"}
        </Button>
      </div>

      <Card bodyStyle={{ padding: isMobile ? 0 : 24 }}>
        {isMobile ? (
          <div style={{ padding: isMobile ? 16 : 0 }}>
            {rooms.map(renderMobileRoomCard)}
          </div>
        ) : (
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
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={isMobile ? "95%" : 900}
        bodyStyle={{ maxHeight: isMobile ? "70vh" : "auto", overflow: "auto" }}
      >
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Modal>
    </div>
  );
}
