// Extended data structure for room and branch details
export interface DetailedTimeSlot {
  id: string;
  time: string;
  price: number;
}

export interface DetailedRoom {
  id: string;
  name: string;
  slug: string;
  timeSlots: DetailedTimeSlot[];
  description: string;
  amenities: string[];
  images: string[];
  price: {
    base: number;
    discount?: number;
    originalPrice?: number;
  };
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
  reviews: number;
}

export interface DetailedBranch {
  id: string;
  name: string;
  slug: string;
  rooms: DetailedRoom[];
  location: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  amenities: string[];
  images: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Mock data for room booking table
export const mockBranches = [
  {
    id: 'lovely',
    name: 'Lovely',
    rooms: [
      {
        id: 'lovely-room1',
        name: 'Lovely Room',
        timeSlots: [
          { id: 'lovely-morning', time: '9:30–12:30', price: 50000 },
          { id: 'lovely-afternoon', time: '13:00–16:00', price: 50000 },
          { id: 'lovely-evening', time: '16:30–19:30', price: 60000 },
        ]
      }
    ]
  },
  {
    id: 'tasty',
    name: 'Tasty 1',
    rooms: [
      {
        id: 'tasty-room1',
        name: 'Tasty Room',
        timeSlots: [
          { id: 'tasty-morning', time: '9:30–12:30', price: 55000 },
          { id: 'tasty-afternoon', time: '13:00–16:00', price: 55000 },
          { id: 'tasty-evening', time: '16:30–19:30', price: 65000 },
        ]
      }
    ]
  },
  {
    id: 'secret',
    name: 'Secret Home',
    rooms: [
      {
        id: 'secret-room1',
        name: 'Secret Room',
        timeSlots: [
          { id: 'secret-morning', time: '9:30–12:30', price: 48000 },
          { id: 'secret-afternoon', time: '13:00–16:00', price: 48000 },
          { id: 'secret-evening', time: '16:30–19:30', price: 58000 },
        ]
      }
    ]
  }
];

// Detailed branches data for dynamic routes
export const detailedBranches: DetailedBranch[] = [
  {
    id: 'lovely',
    name: 'Lovely',
    slug: 'lovely',
    location: 'Đại Ngàn, Ninh Kiều, Cần Thơ',
    address: 'Số 123 Đường Đại Ngàn, Phường Đại Ngàn, Quận Ninh Kiều, TP. Cần Thơ',
    phone: '0932.620.930',
    email: 'lovely@localhome.vn',
    description: 'Chi nhánh Lovely với không gian ấm cúng, hiện đại và đầy đủ tiện nghi',
    amenities: ['WiFi miễn phí', 'Điều hòa', 'TV', 'Máy giặt', 'Tủ lạnh', 'Bếp', 'Hồ bơi'],
    images: ['https://images.placeholders.dev/800x600/667eea/ffffff?text=Lovely+Branch'],
    coordinates: { lat: 10.0346, lng: 105.7887 },
    rooms: [
      {
        id: 'lovely-room1',
        name: 'Lovely',
        slug: 'lovely-room',
        timeSlots: [
          { id: 'lovely-morning', time: '9:30–12:30', price: 50000 },
          { id: 'lovely-afternoon', time: '13:00–16:00', price: 50000 },
          { id: 'lovely-evening', time: '16:30–19:30', price: 60000 },
        ],
        description: 'Căn hộ mới 100% có hồ bơi, view cầu rồng, bãi biển gần chợ Hàn, chợ cơn, free xe đưa đón, máy giặt, tủ lạnh, máy sấy tóc, view từ tầng cao nhìn ra sông Hàn',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV', 'Máy giặt', 'Tủ lạnh', 'Bếp', 'Hồ bơi', 'View sông'],
        images: [
          'https://images.placeholders.dev/800x600/667eea/ffffff?text=Lovely+Room+1',
          'https://images.placeholders.dev/800x600/764ba2/ffffff?text=Lovely+Room+2',
          'https://images.placeholders.dev/800x600/667eea/ffffff?text=Lovely+Room+3'
        ],
        price: {
          base: 179000,
          discount: 44,
          originalPrice: 319000
        },
        location: 'Đại Ngàn, Ninh Kiều',
        area: '45m²',
        capacity: 4,
        bedrooms: 2,
        bathrooms: 1,
        features: ['Hồ bơi', 'View cầu rồng', 'Gần chợ Hàn', 'Free xe đưa đón'],
        policies: [
          'Nhận phòng từ 14:00',
          'Trả phòng trước 12:00',
          'Không hút thuốc trong phòng',
          'Không nuôi thú cưng',
          'Giữ yên lặng sau 22:00'
        ],
        checkIn: '14:00',
        checkOut: '12:00',
        rating: 4.8,
        reviews: 127
      }
    ]
  },
  {
    id: 'tasty',
    name: 'Tasty 1',
    slug: 'tasty-1',
    location: 'Cái Khế, Ninh Kiều, Cần Thơ',
    address: 'Số 456 Đường Cái Khế, Phường Cái Khế, Quận Ninh Kiều, TP. Cần Thơ',
    phone: '0932.620.930',
    email: 'tasty@localhome.vn',
    description: 'Chi nhánh Tasty 1 với phong cách hiện đại, tiện nghi cao cấp',
    amenities: ['WiFi miễn phí', 'Điều hòa', 'TV', 'Máy giặt', 'Tủ lạnh', 'Bếp', 'Gym'],
    images: ['https://images.placeholders.dev/800x600/ff6b6b/ffffff?text=Tasty+Branch'],
    coordinates: { lat: 10.0278, lng: 105.7769 },
    rooms: [
      {
        id: 'tasty-room1',
        name: 'Tasty 1',
        slug: 'tasty-1-room',
        timeSlots: [
          { id: 'tasty-morning', time: '9:30–12:30', price: 55000 },
          { id: 'tasty-afternoon', time: '13:00–16:00', price: 55000 },
          { id: 'tasty-evening', time: '16:30–19:30', price: 65000 },
        ],
        description: 'Căn hộ cao cấp với thiết kế hiện đại, đầy đủ tiện nghi, view đẹp, phù hợp cho gia đình và nhóm bạn',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV', 'Máy giặt', 'Tủ lạnh', 'Bếp', 'Gym', 'Balcony'],
        images: [
          'https://images.placeholders.dev/800x600/ff6b6b/ffffff?text=Tasty+Room+1',
          'https://images.placeholders.dev/800x600/ff8e8e/ffffff?text=Tasty+Room+2',
          'https://images.placeholders.dev/800x600/ff6b6b/ffffff?text=Tasty+Room+3'
        ],
        price: {
          base: 219000,
          discount: 45,
          originalPrice: 399000
        },
        location: 'Cái Khế, Ninh Kiều',
        area: '50m²',
        capacity: 6,
        bedrooms: 2,
        bathrooms: 2,
        features: ['Gym', 'Balcony view', 'Modern design', 'High-end amenities'],
        policies: [
          'Nhận phòng từ 14:00',
          'Trả phòng trước 12:00',
          'Không hút thuốc trong phòng',
          'Không nuôi thú cưng',
          'Giữ yên lặng sau 22:00'
        ],
        checkIn: '14:00',
        checkOut: '12:00',
        rating: 4.6,
        reviews: 89
      }
    ]
  },
  {
    id: 'secret',
    name: 'Secret Home',
    slug: 'secret-home',
    location: 'Hưng Phát, Ninh Kiều, Cần Thơ',
    address: 'Số 789 Đường Hưng Phát, Phường Hưng Phát, Quận Ninh Kiều, TP. Cần Thơ',
    phone: '0932.620.930',
    email: 'secret@localhome.vn',
    description: 'Chi nhánh Secret Home với không gian riêng tư, yên tĩnh, lý tưởng để nghỉ ngơi',
    amenities: ['WiFi miễn phí', 'Điều hòa', 'TV', 'Máy giặt', 'Tủ lạnh', 'Bếp', 'Garden'],
    images: ['https://images.placeholders.dev/800x600/4facfe/ffffff?text=Secret+Branch'],
    coordinates: { lat: 10.0412, lng: 105.7654 },
    rooms: [
      {
        id: 'secret-room1',
        name: 'Secret Home',
        slug: 'secret-home-room',
        timeSlots: [
          { id: 'secret-morning', time: '9:30–12:30', price: 48000 },
          { id: 'secret-afternoon', time: '13:00–16:00', price: 48000 },
          { id: 'secret-evening', time: '16:30–19:30', price: 58000 },
        ],
        description: 'Không gian riêng tư và yên tĩnh, phù hợp cho những ai muốn tìm kiếm sự thư giãn và nghỉ ngơi',
        amenities: ['WiFi miễn phí', 'Điều hòa', 'TV', 'Máy giặt', 'Tủ lạnh', 'Bếp', 'Garden', 'Private space'],
        images: [
          'https://images.placeholders.dev/800x600/4facfe/ffffff?text=Secret+Room+1',
          'https://images.placeholders.dev/800x600/00f2fe/ffffff?text=Secret+Room+2',
          'https://images.placeholders.dev/800x600/4facfe/ffffff?text=Secret+Room+3'
        ],
        price: {
          base: 179000,
          discount: 44,
          originalPrice: 319000
        },
        location: 'Hưng Phát, Ninh Kiều',
        area: '40m²',
        capacity: 4,
        bedrooms: 1,
        bathrooms: 1,
        features: ['Garden view', 'Private space', 'Quiet area', 'Relaxing atmosphere'],
        policies: [
          'Nhận phòng từ 14:00',
          'Trả phòng trước 12:00',
          'Không hút thuốc trong phòng',
          'Không nuôi thú cưng',
          'Giữ yên lặng sau 22:00'
        ],
        checkIn: '14:00',
        checkOut: '12:00',
        rating: 4.9,
        reviews: 156
      }
    ]
  }
];

// Helper function to get branch by slug
export const getBranchBySlug = (slug: string): DetailedBranch | null => {
  return detailedBranches.find(branch => branch.slug === slug) || null;
};

// Helper function to get room by slug
export const getRoomBySlug = (slug: string): DetailedRoom | null => {
  for (const branch of detailedBranches) {
    const room = branch.rooms.find(room => room.slug === slug);
    if (room) return room;
  }
  return null;
};

// Helper function to get all rooms
export const getAllRooms = (): DetailedRoom[] => {
  return detailedBranches.flatMap(branch => branch.rooms);
};

// Mock booking statuses for demonstration
export const mockInitialBookings = {
  // Today
  '2024-12-30': {
    'lovely': {
      'lovely-room1': {
        'morning': { status: 'booked' as const },
        'afternoon': { status: 'available' as const },
        'evening': { status: 'available' as const },
      }
    },
    'tasty': {
      'tasty-room1': {
        'morning': { status: 'available' as const },
        'afternoon': { status: 'booked' as const },
        'evening': { status: 'promotion' as const, price: 45000, originalPrice: 65000 },
      }
    },
    'secret': {
      'secret-room1': {
        'morning': { status: 'available' as const },
        'afternoon': { status: 'available' as const },
        'evening': { status: 'mystery' as const, price: 40000 },
      }
    }
  },
  // Tomorrow
  '2024-12-31': {
    'lovely': {
      'lovely-room1': {
        'morning': { status: 'available' as const },
        'afternoon': { status: 'booked' as const },
        'evening': { status: 'available' as const },
      }
    },
    'tasty': {
      'tasty-room1': {
        'morning': { status: 'booked' as const },
        'afternoon': { status: 'available' as const },
        'evening': { status: 'available' as const },
      }
    },
    'secret': {
      'secret-room1': {
        'morning': { status: 'promotion' as const, price: 35000, originalPrice: 48000 },
        'afternoon': { status: 'available' as const },
        'evening': { status: 'booked' as const },
      }
    }
  },
  // Day after tomorrow  
  '2025-01-01': {
    'lovely': {
      'lovely-room1': {
        'morning': { status: 'available' as const },
        'afternoon': { status: 'available' as const },
        'evening': { status: 'booked' as const },
      }
    },
    'tasty': {
      'tasty-room1': {
        'morning': { status: 'available' as const },
        'afternoon': { status: 'mystery' as const, price: 42000 },
        'evening': { status: 'available' as const },
      }
    },
    'secret': {
      'secret-room1': {
        'morning': { status: 'booked' as const },
        'afternoon': { status: 'available' as const },
        'evening': { status: 'available' as const },
      }
    }
  }
}; 