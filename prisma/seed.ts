import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create branches with nested rooms and time slots (transactional)
  const branches = [
    {
      id: "oni",
      name: "oni",
      slug: "oni",
      location: "Thành phố Huế",
      address: "9/4 Điềm Phùng Thị, phường Vỹ Dạ, Thành phố Huế",
      phone: "0941571155",
      email: "onihomestay@gmail.com",
      description:
        "Nằm giữa lòng thành phố Huế, O Ni Homestay mang đến cho bạn không gian nghỉ dưỡng ấm cúng, chỉ cách những điểm du lịch nổi tiếng như Đại Nội, Cầu Trường Tiền hay Sông Hương vài phút di chuyển. Tại đây, bạn vừa dễ dàng khám phá Huế, vừa tận hưởng tiện nghi hiện đại trong không gian đậm chất địa phương. Nhà O Ni tạo nên không gian đậm chất Huế với thiết kế tinh tế, hài hòa giữa truyền thống và hiện đại, giúp bạn tận hưởng sự thoải mái trọn vẹn như đang ở nhà. O Ni tận tâm chăm sóc từng chi tiết nhỏ nhất, để mỗi khoảnh khắc của bạn ở đây đều ngập tràn yêu thương và sự bình yên.",
      amenities: [
        "Vị trí trung tâm",
        "Check-in tự động",
        "Khu vực bếp chung",
        "Xe đạp miễn phí",
        "Boardgames",
        "Trà chào mừng",
      ],
      images: ["https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/branches/9add96d6-1b9a-4c61-ba50-edac7b32c212.jpg"],
      latitude: 10.0346,
      longitude: 105.7887,
      googleMapUrl: "https://maps.app.goo.gl/78M6w48Hwib6tEo9A",
      isActive: true,
      rooms: {
        create: [
          {
            id: "family-room",
            name: "Phòng Family",
            slug: "family-room",
            description:
              "Hai phòng nằm cạnh nhau giữa khoảng vườn xanh, Phòng Mộng và Phòng Hương là hai mảnh ghép dịu dàng của Huế – một bên trầm lắng, một bên tươi sáng. Phòng Mộng mang nét cổ điển Huế với sắc vàng ấm và ánh đèn dịu, gợi cảm giác an yên và sâu lắng. Phòng Hương có ban công đón nắng, hòa sắc xanh lá mạ cùng gió sớm, mang lại sự tươi mới và dịu dàng như chính người con gái xứ này.",
            amenities: [
              "Không gian vườn",
              "Điều hòa",
              "Wifi miễn phí",
              "Giường 1m8 và 1m6",
              "Máy chiếu (Netflix)",
              "Boardgames",
              "Nước suối miễn phí",
              "Bếp chung",
              "Gương toàn thân",
              "Xích đu ngoài trời",
            ],
            images: [
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/70a73fc7-6fdf-4507-95cf-dfd42dc13f96.png",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/ae3da4bd-5c6f-4c81-9d3a-340b20341edd.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/c7d27545-286d-4f7d-a270-64f775c48f63.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/78e6ba76-29de-4a5d-999b-129dce17b34a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/0a3d2671-a724-494c-a899-f9d00da00573.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/07a5737b-7f6f-4e0f-bb29-ed7340aa0b2a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/20af27f5-f6f3-448d-b1fd-c7656545b630.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/fd9b3b7f-e6e1-443d-8f5a-92db51e0e29a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/7c6fbb81-c9d1-47ab-aa85-658a53366ec0.jpg",
            ],
            basePrice: 720000,
            discountPrice: 720000,
            originalPrice: 720000,
            location: "Tầng 3",
            floor: "3",
            area: "18m² & 9m²",
            capacity: 5,
            bedrooms: 2,
            bathrooms: 1,
            features: [
              "Phong cách cổ điển Huế",
              "Không gian rộng rãi, yên tĩnh",
              "Góc vườn riêng tư",
            ],
            policies: [
              "Nhận phòng từ 14:00",
              "Trả phòng trước 12:00",
              "Không hút thuốc trong phòng",
              "Không nuôi thú cưng",
              "Giữ yên lặng sau 22:00",
            ],
            checkIn: "14:00",
            checkOut: "12:00",
            rating: 4.8,
            reviewCount: 127,
            isActive: true,
            timeSlots: {
              create: [
                {
                  id: "family-overnight",
                  time: "1 ngày (14h-12h)",
                  price: 720000,
                  duration: 22,
                  isOvernight: true,
                  weekendSurcharge: 0,
                  isActive: true,
                },
                {
                  id: "family-2h",
                  time: "2 giờ",
                  price: 350000,
                  duration: 2,
                  isOvernight: false,
                  weekendSurcharge: 0,
                  isActive: true,
                },
                {
                  id: "family-3h",
                  time: "3h tặng 1h",
                  price: 470000,
                  duration: 4,
                  isOvernight: false,
                  weekendSurcharge: 0,
                  isActive: true,
                },
                {
                  id: "family-extrahours",
                  time: "1 giờ",
                  price: 75000,
                  duration: 1,
                  isOvernight: false,
                  weekendSurcharge: 0,
                  isActive: true,
                },
              ],
            },
          },
          {
            id: "mong-room",
            name: "Phòng Mộng",
            slug: "mong-room",
            description:
              "Căn phòng mang âm hưởng của nghệ thuật Huế truyền thống. Không gian với tông màu vàng nhạt như những trang thư tịch cổ-lưu giữ tinh hoa văn hóa bao đời ở Huế. Nội thất trầm ấm với kệ sách và đĩa nhạc xưa khẽ kể về một Huế trầm mặc, sâu lắng trong tâm hồn nghệ thuật. Ánh sáng dịu nhẹ từ đèn trang trí tạo nên không gian để thưởng thức những giai điệu truyền thống đã nuôi dưỡng tâm hồn người dân xứ Huế qua bao thế hệ.",
            amenities: [
              "Nhà vệ sinh riêng",
              "Điều hòa",
              "Wifi miễn phí",
              "Máy chiếu (Netflix)",
              "Giường 1m8",
              "Boardgames",
              "Nước suối miễn phí",
              "Bếp chung",
              "Gương toàn thân",
              "Máy sấy tóc",
            ],
            images: [
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/2d466a00-3735-4d2d-ac10-5d452922aa37.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/f0000e92-f20a-482d-9adf-dc0ae1ffb866.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/4218131b-4b14-41bd-9206-7aa6e9426f91.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/65f87096-12f6-4da3-8899-dfafed96c753.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/fa7b15a4-781e-4498-b70b-b982a3f98d41.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/51a28983-d290-4884-8011-cde3f0eade77.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/07a5737b-7f6f-4e0f-bb29-ed7340aa0b2a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/20af27f5-f6f3-448d-b1fd-c7656545b630.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/fd9b3b7f-e6e1-443d-8f5a-92db51e0e29a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/7c6fbb81-c9d1-47ab-aa85-658a53366ec0.jpg",
            ],
            basePrice: 520000,
            discountPrice: 520000,
            originalPrice: 520000,
            location: "Tầng 3",
            floor: "3",
            area: "20m²",
            capacity: 2,
            bedrooms: 1,
            bathrooms: 1,
            features: ["Kệ sách cũ", "Đĩa than xưa"],
            policies: [
              "Nhận phòng từ 14:00",
              "Trả phòng trước 12:00",
              "Không hút thuốc trong phòng",
              "Không nuôi thú cưng",
              "Giữ yên lặng sau 22:00",
            ],
            checkIn: "14:00",
            checkOut: "12:00",
            rating: 4.8,
            reviewCount: 127,
            isActive: true,
            timeSlots: {
              create: [
                {
                  id: "mong-overnight",
                  time: "1 ngày (14h-12h)",
                  price: 520000,
                  duration: 22,
                  isOvernight: true,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
                {
                  id: "mong-2h",
                  time: "2 giờ",
                  price: 220000,
                  duration: 2,
                  isOvernight: false,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
                {
                  id: "mong-3h",
                  time: "3h tặng 1h",
                  price: 290000,
                  duration: 4,
                  isOvernight: false,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
                {
                  id: "mong-extrahours",
                  time: "1 giờ",
                  price: 60000,
                  duration: 1,
                  isOvernight: false,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
              ],
            },
          },
          {
            id: "tho-room",
            name: "Phòng Thơ",
            slug: "tho-room",
            description:
              "Màu xanh nhẹ nhàng kết hợp với ánh sáng vàng ấm áp tạo nên một bầu không khí thư giãn, đầy sự bình yên. Đây là căn phòng gợi nhớ đến những ngôi nhà cổ của Huế xưa, nơi ánh đèn vàng lấp ló trong đêm tối. Nội thất gỗ trầm màu nâu tối, kết hợp với những món đồ trang trí giản dị, mang lại cảm giác ấm cúng và thân thuộc, như thể bạn đang sống trong một không gian của quá khứ, hòa mình vào vẻ đẹp cổ kính của Huế.",
            amenities: [
              "Nhà vệ sinh riêng",
              "Điều hòa",
              "Wifi miễn phí",
              "Giường 1m6",
              "Máy chiếu (Netflix)",
              "Boardgames",
              "Nước suối miễn phí",
              "Bếp chung",
              "Gương toàn thân",
              "Xích đu ngoài trời",
            ],
            images: [
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/a2c9c728-da64-42c4-b516-169e97cb3355.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/8e142cd2-cb62-4b51-a19d-c3791739fe84.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/e4f989d5-741f-4655-bb2d-6b59007a45f3.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/be3f13e4-9db8-47a4-8686-e51206b166d1.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/fc9a0977-5f37-4e90-b5a5-e5a2a4650dbe.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/0f51fb22-eea1-491d-b7c6-b74e12c800a9.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/286045d0-1058-4fc2-9a64-542598300e3b.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/a37add68-d763-498a-a580-248b42d7afcc.JPG",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/07a5737b-7f6f-4e0f-bb29-ed7340aa0b2a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/20af27f5-f6f3-448d-b1fd-c7656545b630.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/fd9b3b7f-e6e1-443d-8f5a-92db51e0e29a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/7c6fbb81-c9d1-47ab-aa85-658a53366ec0.jpg",
            ],
            basePrice: 499000,
            discountPrice: 499000,
            originalPrice: 499000,
            location: "Tầng 2",
            floor: "2",
            area: "18.5m²",
            capacity: 2,
            bedrooms: 1,
            bathrooms: 1,
            features: [
              "Phong cách cổ điển Huế",
              "Không gian rộng rãi, yên tĩnh",
              "Ánh sáng vàng ấm áp",
            ],
            policies: [
              "Nhận phòng từ 14:00",
              "Trả phòng trước 12:00",
              "Không hút thuốc trong phòng",
              "Không nuôi thú cưng",
              "Giữ yên lặng sau 22:00",
            ],
            checkIn: "14:00",
            checkOut: "12:00",
            rating: 4.8,
            reviewCount: 127,
            isActive: true,
            timeSlots: {
              create: [
                {
                  id: "tho-overnight",
                  time: "1 ngày (14h-12h)",
                  price: 499000,
                  duration: 22,
                  isOvernight: true,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
                {
                  id: "tho-2h",
                  time: "2 giờ",
                  price: 200000,
                  duration: 2,
                  isOvernight: false,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
                {
                  id: "tho-3h",
                  time: "3h tặng 1h",
                  price: 250000,
                  duration: 4,
                  isOvernight: false,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
                {
                  id: "tho-extrahours",
                  time: "1 giờ",
                  price: 60000,
                  duration: 1,
                  isOvernight: false,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
              ],
            },
          },
          {
            id: "tam-room",
            name: "Phòng Tâm",
            slug: "tam-room",
            description:
              "Mang một không gian sắc vàng nhạt nhẹ nhàng, gợi nhớ đến những ngày yên bình trong triều đình Huế xưa. Mỗi chi tiết trong phòng đều chứa đựng những nét văn hóa truyền thống đặc sắc, từ chiếc bàn trà gỗ đến những món đồ trang trí giản dị, thể hiện sự thanh nhã của một thời kỳ lịch sử. Ban công phòng lớn là nơi lý tưởng để bạn thư giãn, ngắm nhìn hoàng hôn lặng lẽ dần buông xuống, và cảm nhận không khí trong lành của thành phố cổ.",
            amenities: [
              "Ban công",
              "Nhà vệ sinh riêng",
              "Điều hòa",
              "Wifi miễn phí",
              "Giường 1m6",
              "Máy chiếu (Netflix)",
              "Boardgames",
              "Nước suối miễn phí",
              "Bếp chung",
              "Gương toàn thân",
              "Máy sấy tóc",
            ],
            images: [
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/0129ba1a-4b0d-484a-bb8a-3805d5e50f00.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/a4ed59eb-e8d5-43ce-9797-451f1049d44e.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/f52c1b84-9db3-4ea2-99a2-e06e1c589ec2.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/2971f88f-cf36-4552-bd1e-a455f6030ad0.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/88391cf9-38dc-4fee-bde6-08bbe35fc332.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/0cf0bc09-5892-4f7f-b93f-3b5f3fa474b2.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/2aae7bf4-5439-401e-805d-769a1ebf19b3.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/3c5b0e27-edf5-4fa3-ad80-21439ed73b1d.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/46694312-9361-4ef5-bae4-cc667e526dc0.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/07a5737b-7f6f-4e0f-bb29-ed7340aa0b2a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/20af27f5-f6f3-448d-b1fd-c7656545b630.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/fd9b3b7f-e6e1-443d-8f5a-92db51e0e29a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/7c6fbb81-c9d1-47ab-aa85-658a53366ec0.jpg",
            ],
            basePrice: 560000,
            discountPrice: 560000,
            originalPrice: 560000,
            location: "Tầng 2",
            floor: "2",
            area: "20m²",
            capacity: 2,
            bedrooms: 1,
            bathrooms: 1,
            features: [
              "Phong cách cổ điển Huế",
              "Không gian rộng rãi, yên tĩnh",
              "Ánh sáng vàng ấm áp",
            ],
            policies: [
              "Nhận phòng từ 14:00",
              "Trả phòng trước 12:00",
              "Không hút thuốc trong phòng",
              "Không nuôi thú cưng",
              "Giữ yên lặng sau 22:00",
            ],
            checkIn: "14:00",
            checkOut: "12:00",
            rating: 4.8,
            reviewCount: 127,
            isActive: true,
            timeSlots: {
              create: [
                {
                  id: "tam-overnight",
                  time: "1 ngày (14h-12h)",
                  price: 560000,
                  duration: 22,
                  isOvernight: true,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
                {
                  id: "tam-2h",
                  time: "2 giờ",
                  price: 250000,
                  duration: 2,
                  isOvernight: false,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
                {
                  id: "tam-3h",
                  time: "3h tặng 1h",
                  price: 310000,
                  duration: 4,
                  isOvernight: false,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
                {
                  id: "tam-extrahours",
                  time: "1 giờ",
                  price: 60000,
                  duration: 1,
                  isOvernight: false,
                  weekendSurcharge: 50000,
                  isActive: true,
                },
              ],
            },
          },
          {
            id: "song-room",
            name: "Phòng Sông",
            slug: "song-room",
            description:
              "Không gian phòng ấm áp với tông vàng kem nhẹ nhàng, kết hợp cùng nội thất gỗ tự nhiên, mang lại cảm giác yên bình và thư thái. Qua khung cửa sổ lớn, bạn có thể chiêm ngưỡng toàn cảnh thành phố, như các vị quan triều Nguyễn từng ngắm nhìn kinh thành từ điện Càn Thành. Những chiếc đèn tre với ánh sáng vàng dịu nhẹ tạo nên không gian gần gũi, mộc mạc, gợi nhớ tinh thần giản dị của xứ Huế.",
            amenities: [
              "Phòng tắm kính riêng",
              "Cửa sổ view thành phố",
              "Điều hòa",
              "Wifi miễn phí",
              "Giường 1m6",
              "Máy chiếu (Netflix)",
              "Boardgames",
              "Nước suối miễn phí",
              "Bếp chung",
              "Gương toàn thân",
            ],
            images: [
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/b160bfba-3ce5-496c-953a-c1eb70dbdb16.png",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/119e7384-1d8f-4eda-b935-06c0dcc6ed2a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/a10b09ac-1877-4286-a4c1-e2b30a5e1204.png",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/010de0c2-8271-4723-a067-c1e9aad046f5.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/409b7197-7e30-4481-a38f-e4e3b8c99ee4.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/1b0591cf-f570-48b1-a499-b35729293b36.png",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/92ce3066-6c0f-45f9-91c8-b153a27959cb.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/07a5737b-7f6f-4e0f-bb29-ed7340aa0b2a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/20af27f5-f6f3-448d-b1fd-c7656545b630.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/fd9b3b7f-e6e1-443d-8f5a-92db51e0e29a.jpg",
              "https://tl-my-booking-app.s3.ap-southeast-1.amazonaws.com/rooms/7c6fbb81-c9d1-47ab-aa85-658a53366ec0.jpg",
            ],
            basePrice: 599000,
            discountPrice: 599000,
            originalPrice: 599000,
            location: "Tầng 4",
            floor: "4",
            area: "18.5m²",
            capacity: 2,
            bedrooms: 1,
            bathrooms: 1,
            features: [
              "Phong cách cổ điển Huế",
              "Không gian rộng rãi, yên tĩnh",
              "Ánh sáng vàng ấm áp",
            ],
            policies: [
              "Nhận phòng từ 14:00",
              "Trả phòng trước 12:00",
              "Không hút thuốc trong phòng",
              "Không nuôi thú cưng",
              "Giữ yên lặng sau 22:00",
            ],
            checkIn: "14:00",
            checkOut: "12:00",
            rating: 4.8,
            reviewCount: 127,
            isActive: true,
            timeSlots: {
              create: [
                {
                  id: "song-overnight",
                  time: "1 ngày (14h-12h)",
                  price: 599000,
                  duration: 22,
                  isOvernight: true,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
                {
                  id: "song-2h",
                  time: "2 giờ",
                  price: 270000,
                  duration: 2,
                  isOvernight: false,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
                {
                  id: "song-3h",
                  time: "3h tặng 1h",
                  price: 330000,
                  duration: 4,
                  isOvernight: false,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
                {
                  id: "song-extrahours",
                  time: "1 giờ",
                  price: 60000,
                  duration: 1,
                  isOvernight: false,
                  weekendSurcharge: 30000,
                  isActive: true,
                },
              ],
            },
          },
        ],
      },
    },
  ];

  // Create all branches with nested relations in a single transaction
  for (const branchData of branches) {
    const branch = await prisma.branch.create({
      data: branchData,
      include: {
        rooms: {
          include: {
            timeSlots: true,
          },
        },
      },
    });

    console.log(`✅ Created branch: ${branch.name}`);
    console.log(`  📍 Created ${branch.rooms.length} rooms`);

    let totalTimeSlots = 0;
    branch.rooms.forEach((room) => {
      totalTimeSlots += room.timeSlots.length;
    });
    console.log(`  ⏰ Created ${totalTimeSlots} time slots`);
  }

  // Create a default admin user with hashed password
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@localhome.vn",
      name: "Admin",
      phone: "0932620930",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(
    `👤 Created admin user: ${adminUser.email} with password: admin123`
  );

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
