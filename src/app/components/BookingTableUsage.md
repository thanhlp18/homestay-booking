# RoomBookingTable Component Usage Guide

## Overview
The `RoomBookingTable` is a comprehensive, reusable React component for managing room booking appointments with time slots. It provides an interactive grid interface where users can select available time slots across multiple days and rooms.

## Features
✅ **Multi-branch Support** - Display multiple branches/locations
✅ **Time Slot Management** - Configurable time slots per room
✅ **Interactive Selection** - Click to select/deselect available slots
✅ **Dynamic Pricing** - Automatic discounts for multiple bookings
✅ **Status Indicators** - Visual status for booked, available, promotion, mystery slots
✅ **Responsive Design** - Mobile-friendly with horizontal scroll
✅ **Vietnamese Localization** - Full Vietnamese language support

## Props Interface

```typescript
interface RoomBookingTableProps {
  branches: Branch[];                    // Required: Array of branches with rooms and time slots
  startDate?: Date;                      // Optional: Starting date (default: today)
  daysCount?: number;                    // Optional: Number of days to display (default: 7)
  slotPrice?: number;                    // Optional: Default price per slot (default: 50000)
  onBookingSubmit?: (selectedSlots: SelectedSlot[]) => void; // Optional: Callback for booking submission
  initialBookings?: Record<string, Record<string, Record<string, Record<string, BookingStatus>>>>; // Optional: Pre-existing bookings
}
```

## Data Structure

### Branch Structure
```typescript
interface Branch {
  id: string;
  name: string;
  rooms: Room[];
}

interface Room {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  time: string;    // Display format: "9:30–12:30"
  price: number;   // Price in VND
}
```

### Booking Status
```typescript
interface BookingStatus {
  status: 'booked' | 'available' | 'selected' | 'promotion' | 'mystery';
  price?: number;        // Override price for promotions/special offers
  originalPrice?: number; // Original price to show discount
}
```

## Usage Examples

### Basic Usage
```typescript
import RoomBookingTable from './components/RoomBookingTable';

const branches = [
  {
    id: 'branch1',
    name: 'Main Branch',
    rooms: [
      {
        id: 'room1',
        name: 'Conference Room A',
        timeSlots: [
          { id: 'morning', time: '9:00–12:00', price: 100000 },
          { id: 'afternoon', time: '13:00–17:00', price: 120000 }
        ]
      }
    ]
  }
];

function MyBookingPage() {
  const handleBookingSubmit = (selectedSlots) => {
    console.log('Booking submitted:', selectedSlots);
    // Handle booking logic here
  };

  return (
    <RoomBookingTable
      branches={branches}
      onBookingSubmit={handleBookingSubmit}
    />
  );
}
```

### Advanced Usage with Initial Bookings
```typescript
const initialBookings = {
  '2024-12-30': {
    'branch1': {
      'room1': {
        'morning': { status: 'booked' },
        'afternoon': { status: 'promotion', price: 90000, originalPrice: 120000 }
      }
    }
  }
};

<RoomBookingTable
  branches={branches}
  initialBookings={initialBookings}
  startDate={new Date('2024-12-30')}
  daysCount={14}
  slotPrice={100000}
  onBookingSubmit={handleBookingSubmit}
/>
```

## Status Types and Colors

| Status | Display | Color | Description |
|--------|---------|-------|-------------|
| `available` | "Còn trống" | Red border, white background | Available for booking |
| `booked` | "Đã đặt" | Red background, white text | Already booked |
| `selected` | "Đang chọn" | Purple gradient, white text | Currently selected by user |
| `promotion` | "🎁 Khuyến mãi" | Green gradient, white text | Special promotion offer |
| `mystery` | "🛍️ Túi mù" | Orange gradient, white text | Mystery/surprise booking |

## Pricing Logic

### Automatic Discounts
- **2 slots**: 5% discount
- **3+ slots**: 10% discount

### Price Calculation
```typescript
const baseTotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
const discount = slotCount >= 3 ? 0.1 : slotCount === 2 ? 0.05 : 0;
const finalTotal = baseTotal * (1 - discount);
```

## Event Handling

### onBookingSubmit Callback
```typescript
const handleBookingSubmit = (selectedSlots: SelectedSlot[]) => {
  // selectedSlots contains:
  // - date: string (ISO format)
  // - branchId: string
  // - roomId: string
  // - timeSlotId: string
  // - price: number
  
  // Example: Submit to API
  api.createBooking({
    slots: selectedSlots,
    userId: currentUser.id,
    totalPrice: selectedSlots.reduce((sum, slot) => sum + slot.price, 0)
  });
};
```

## Responsive Behavior

### Desktop (1024px+)
- Full table layout with all columns visible
- Hover effects on cells
- Sticky date column for easy navigation

### Tablet (768px - 1024px)
- Reduced font sizes
- Compressed time slot headers
- Maintained horizontal scroll

### Mobile (< 768px)
- Vertical price section layout
- Full-width submit button
- Optimized for touch interactions

## Customization

### Styling
Override CSS module classes:
```css
/* Custom styles */
.bookingTable .cell.available:hover {
  background: your-custom-color;
}
```

### Localization
Update text strings in the component:
```typescript
// In component, change these strings:
'Hôm nay' → 'Today'
'Còn trống' → 'Available'
'Đã đặt' → 'Booked'
```

## Integration Tips

1. **State Management**: Consider using Redux/Zustand for complex booking flows
2. **API Integration**: Replace mock data with real API calls
3. **Real-time Updates**: Integrate WebSocket for live availability updates
4. **Validation**: Add booking rules (min/max duration, advance booking limits)
5. **Payment Integration**: Connect with payment gateways for complete booking flow

## Performance Notes

- Component is optimized for up to 50+ time slots across 7 days
- Use `React.memo` for large datasets
- Consider virtualization for 100+ rooms or extended date ranges
- Date calculations are cached to prevent unnecessary re-renders 