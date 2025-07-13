import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create branches with rooms and time slots
  const branches = [
    {
      id: "lovely",
      name: "Lovely",
      slug: "lovely",
      location: "Đại Ngàn, Ninh Kiều, Cần Thơ",
      address:
        "Số 123 Đường Đại Ngàn, Phường Đại Ngàn, Quận Ninh Kiều, TP. Cần Thơ",
      phone: "0939000000",
      email: "lovely@localhome.vn",
      description:
        "Chi nhánh Lovely với không gian ấm cúng, hiện đại và đầy đủ tiện nghi",
      amenities: ["WiFi miễn phí", "TV", "Hồ bơi"],
      images: ["/images/branches/lovely-1.jpg"],
      latitude: 10.0346,
      longitude: 105.7887,
      rooms: [
        {
          id: "lovely-room1",
          name: "Lovely",
          slug: "lovely-room",
          description:
            "Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón, máy giặt, tủ lạnh, máy sấy tóc, view từ tầng cao nhìn ra sông Hàn",
          amenities: [
            "WiFi miễn phí",
            "TV",
            "View sông",
            "Bàn trang điểm",
            "Ghế sách",
          ],
          images: [
            "/images/rooms/lovely-room1-1.jpg",
            "/images/rooms/lovely-room1-2.jpg",
            "/images/rooms/lovely-room1-3.jpg",
          ],
          basePrice: 179000,
          discountPrice: 179000,
          originalPrice: 319000,
          location: "Đại Ngàn, Ninh Kiều",
          area: "45m²",
          capacity: 4,
          bedrooms: 2,
          bathrooms: 1,
          features: ["View cầu rồng", "Gần chợ Hàn", "Free xe đưa đón"],
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
          timeSlots: [
            { id: "lovely-morning", time: "9:30–12:30", price: 50000 },
            { id: "lovely-afternoon", time: "13:00–16:00", price: 50000 },
            { id: "lovely-evening", time: "16:30–19:30", price: 60000 },
          ],
        },
      ],
    },
    {
      id: "tasty",
      name: "Tasty 1",
      slug: "tasty-1",
      location: "Cái Khế, Ninh Kiều, Cần Thơ",
      address:
        "Số 456 Đường Cái Khế, Phường Cái Khế, Quận Ninh Kiều, TP. Cần Thơ",
      phone: "0939000000",
      email: "tasty@localhome.vn",
      description:
        "Chi nhánh Tasty 1 với phong cách hiện đại, tiện nghi cao cấp",
      amenities: ["WiFi miễn phí", "TV", "Gym"],
      images: ["/images/branches/tasty-1.jpg"],
      latitude: 10.0278,
      longitude: 105.7769,
      rooms: [
        {
          id: "tasty-room1",
          name: "Tasty 1",
          slug: "tasty-1-room",
          description:
            "Căn hộ cao cấp với thiết kế hiện đại, đầy đủ tiện nghi, view đẹp, phù hợp cho gia đình và nhóm bạn",
          amenities: ["WiFi miễn phí", "TV", "Gym", "Gương king", "Ghế sách"],
          images: [
            "/images/rooms/tasty-room1-1.jpg",
            "/images/rooms/tasty-room1-2.jpg",
            "/images/rooms/tasty-room1-3.jpg",
          ],
          basePrice: 219000,
          discountPrice: 219000,
          originalPrice: 399000,
          location: "Cái Khế, Ninh Kiều",
          area: "50m²",
          capacity: 6,
          bedrooms: 2,
          bathrooms: 2,
          features: [
            "Gym",
            "Balcony view",
            "Modern design",
            "High-end amenities",
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
          rating: 4.7,
          reviewCount: 89,
          timeSlots: [
            { id: "tasty-morning", time: "9:30–12:30", price: 55000 },
            { id: "tasty-afternoon", time: "13:00–16:00", price: 55000 },
            { id: "tasty-evening", time: "16:30–19:30", price: 65000 },
          ],
        },
      ],
    },
    {
      id: "secret",
      name: "Secret Home",
      slug: "secret-home",
      location: "Hưng Phát, Ninh Kiều, Cần Thơ",
      address:
        "Số 789 Đường Hưng Phát, Phường Hưng Phát, Quận Ninh Kiều, TP. Cần Thơ",
      phone: "0939000000",
      email: "secret@localhome.vn",
      description: "Chi nhánh Secret Home với không gian riêng tư, yên tĩnh",
      amenities: ["WiFi miễn phí", "TV", "Garden"],
      images: ["/images/branches/secret-1.jpg"],
      latitude: 10.0412,
      longitude: 105.7705,
      rooms: [
        {
          id: "secret-room1",
          name: "Secret Home",
          slug: "secret-home-room",
          description:
            "Không gian riêng tư, yên tĩnh, phù hợp cho nghỉ ngơi thư giãn",
          amenities: [
            "WiFi miễn phí",
            "TV",
            "Private space",
            "Máy game",
            "Gương toàn thân",
            "Netflix",
            "Ghế sách",
            "Ghế lười",
          ],
          images: [
            "/images/rooms/secret-room1-1.jpg",
            "/images/rooms/secret-room1-2.jpg",
            "/images/rooms/secret-room1-3.jpg",
          ],
          basePrice: 179000,
          discountPrice: 179000,
          originalPrice: 319000,
          location: "Hưng Phát, Ninh Kiều",
          area: "42m²",
          capacity: 4,
          bedrooms: 2,
          bathrooms: 1,
          features: [
            "Private garden",
            "Quiet area",
            "Secluded location",
            "Peaceful environment",
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
          rating: 4.9,
          reviewCount: 156,
          timeSlots: [
            { id: "secret-morning", time: "9:30–12:30", price: 48000 },
            { id: "secret-afternoon", time: "13:00–16:00", price: 48000 },
            { id: "secret-evening", time: "16:30–19:30", price: 58000 },
          ],
        },
      ],
    },
  ];

  // Create branches, rooms, and time slots
  for (const branchData of branches) {
    // Create branch
    const branch = await prisma.branch.create({
      data: {
        id: branchData.id,
        name: branchData.name,
        slug: branchData.slug,
        location: branchData.location,
        address: branchData.address,
        phone: branchData.phone,
        email: branchData.email,
        description: branchData.description,
        amenities: branchData.amenities,
        images: branchData.images,
        latitude: branchData.latitude,
        longitude: branchData.longitude,
      },
    });

    console.log(`✅ Created branch: ${branch.name}`);

    // Create rooms for this branch
    for (const roomData of branchData.rooms) {
      const room = await prisma.room.create({
        data: {
          id: roomData.id,
          name: roomData.name,
          slug: roomData.slug,
          description: roomData.description,
          amenities: roomData.amenities,
          images: roomData.images,
          basePrice: roomData.basePrice,
          discountPrice: roomData.discountPrice,
          originalPrice: roomData.originalPrice,
          location: roomData.location,
          area: roomData.area,
          capacity: roomData.capacity,
          bedrooms: roomData.bedrooms,
          bathrooms: roomData.bathrooms,
          features: roomData.features,
          policies: roomData.policies,
          checkIn: roomData.checkIn,
          checkOut: roomData.checkOut,
          rating: roomData.rating,
          reviewCount: roomData.reviewCount,
          branchId: branch.id,
        },
      });

      console.log(`  📍 Created room: ${room.name}`);

      // Create time slots for this room
      for (const timeSlotData of roomData.timeSlots) {
        const timeSlot = await prisma.timeSlot.create({
          data: {
            id: timeSlotData.id,
            time: timeSlotData.time,
            price: timeSlotData.price,
            roomId: room.id,
          },
        });

        console.log(
          `    ⏰ Created time slot: ${
            timeSlot.time
          } - ${timeSlot.price.toLocaleString("vi-VN")}đ`
        );
      }
    }
  }

  // Create a default admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@localhome.vn",
      name: "Admin",
      phone: "0932620930",
      role: "ADMIN",
    },
  });

  console.log(`👤 Created admin user: ${adminUser.email}`);

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
