# Price Update Summary

## Overview
Updated the booking app to use prices from the database instead of hardcoded values throughout the application.

## Changes Made

### 1. **RoomBookingTable Component**
- **File**: `src/app/components/RoomBookingTable.tsx`
- **Changes**:
  - Removed `slotPrice` prop from interface
  - Removed hardcoded `slotPrice = 50000` default parameter
  - Updated `handleCellClick` to use `timeSlot.price` directly
  - Removed fallback to `slotPrice` since database always provides prices

### 2. **Updated Component Usage**
Removed hardcoded `slotPrice={50000}` from:
- ✅ `src/app/branches/[branchSlug]/page.tsx`
- ✅ `src/app/rooms/[roomSlug]/page.tsx`

### 3. **Documentation Updates**
- **File**: `src/app/components/BookingTableUsage.md`
- **Changes**: Updated to reflect that prices come from database

## Database Price Structure

The database contains the following price structure:

### **Lovely Branch**
- Morning (9:30–12:30): 50,000đ
- Afternoon (13:00–16:00): 50,000đ  
- Evening (16:30–19:30): 60,000đ

### **Tasty 1 Branch**
- Morning (9:30–12:30): 55,000đ
- Afternoon (13:00–16:00): 55,000đ
- Evening (16:30–19:30): 65,000đ

### **Secret Home Branch**
- Morning (9:30–12:30): 48,000đ
- Afternoon (13:00–16:00): 48,000đ
- Evening (16:30–19:30): 58,000đ

## Benefits

1. **Dynamic Pricing**: Prices can be updated in the database without code changes
2. **Consistency**: All prices come from a single source of truth
3. **Flexibility**: Different time slots can have different prices
4. **Maintainability**: No need to update hardcoded values across multiple files
5. **Accuracy**: Prices reflect actual database values

## API Integration

The `/api/branches` endpoint already returns the correct price structure:
```json
{
  "timeSlots": [
    {
      "id": "lovely-morning",
      "time": "9:30–12:30", 
      "price": 50000
    }
  ]
}
```

## Files Not Changed

The following files already use database prices correctly:
- ✅ `src/app/page.tsx` - Uses `room.basePrice` and `room.originalPrice`
- ✅ `src/app/admin/page.tsx` - Uses `booking.totalPrice` and `booking.basePrice`
- ✅ `src/app/payment/page.tsx` - Uses `bookingData.price`
- ✅ `src/app/rooms/[roomSlug]/page.tsx` - Uses `room.basePrice` and `room.originalPrice`
- ✅ `src/app/branches/[branchSlug]/page.tsx` - Uses `room.basePrice` and `room.originalPrice`

## Testing

To verify the changes:
1. Start the development server: `npm run dev`
2. Navigate to any page with the booking table
3. Check that prices shown match the database values
4. Verify that booking calculations use the correct prices

## Migration Notes

- The mock data file (`src/app/data/bookingData.ts`) still contains hardcoded prices but is not used by the application
- The seed file (`prisma/seed.ts`) contains the correct database prices
- All price displays now use `toLocaleString('vi-VN')` for proper Vietnamese formatting 