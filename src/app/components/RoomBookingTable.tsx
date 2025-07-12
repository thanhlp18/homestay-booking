'use client';

import { useState } from 'react';
import styles from './RoomBookingTable.module.css';

// Types
interface TimeSlot {
  id: string;
  time: string;
  price: number;
}

interface Room {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
}

interface Branch {
  id: string;
  name: string;
  rooms: Room[];
}

interface BookingStatus {
  status: 'booked' | 'available' | 'selected' | 'promotion' | 'mystery';
  price?: number;
  originalPrice?: number;
}

interface SelectedSlot {
  date: string;
  branchId: string;
  roomId: string;
  timeSlotId: string;
  price: number;
}

interface RoomBookingTableProps {
  branches: Branch[];
  startDate?: Date;
  daysCount?: number;
  slotPrice?: number;
  onBookingSubmit?: (selectedSlots: SelectedSlot[]) => void;
  initialBookings?: Record<string, Record<string, Record<string, Record<string, BookingStatus>>>>;
}

export default function RoomBookingTable({
  branches,
  startDate = new Date(),
  daysCount = 7,
  slotPrice = 50000,
  onBookingSubmit,
  initialBookings = {}
}: RoomBookingTableProps) {
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [bookings] = useState(initialBookings);

  // Generate dates
  const generateDates = () => {
    const dates = [];
    const vietnameseDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayName = i === 0 ? 'Hôm nay' : vietnameseDays[date.getDay()];
      const dateString = date.toLocaleDateString('vi-VN');
      const dateKey = date.toISOString().split('T')[0];
      
      dates.push({
        key: dateKey,
        dayName,
        dateString,
        date
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Get booking status for a specific slot
  const getBookingStatus = (dateKey: string, branchId: string, roomId: string, timeSlotId: string): BookingStatus => {
    return bookings[dateKey]?.[branchId]?.[roomId]?.[timeSlotId] || { status: 'available' };
  };

  // Check if slot is selected
  const isSelected = (dateKey: string, branchId: string, roomId: string, timeSlotId: string): boolean => {
    return selectedSlots.some(slot => 
      slot.date === dateKey && 
      slot.branchId === branchId && 
      slot.roomId === roomId && 
      slot.timeSlotId === timeSlotId
    );
  };

  // Handle cell click
  const handleCellClick = (dateKey: string, branchId: string, roomId: string, timeSlot: TimeSlot) => {
    const bookingStatus = getBookingStatus(dateKey, branchId, roomId, timeSlot.id);
    
    // Only allow selection of available slots
    if (bookingStatus.status !== 'available') return;

    const slotIdentifier = { date: dateKey, branchId, roomId, timeSlotId: timeSlot.id };
    const isCurrentlySelected = isSelected(dateKey, branchId, roomId, timeSlot.id);

    if (isCurrentlySelected) {
      // Remove from selection
      setSelectedSlots(prev => prev.filter(slot => 
        !(slot.date === dateKey && 
          slot.branchId === branchId && 
          slot.roomId === roomId && 
          slot.timeSlotId === timeSlot.id)
      ));
    } else {
      // Add to selection
      const newSlot: SelectedSlot = {
        ...slotIdentifier,
        price: timeSlot.price || slotPrice
      };
      setSelectedSlots(prev => [...prev, newSlot]);
    }
  };

  // Calculate total price with discounts
  const calculateTotal = () => {
    const baseTotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    const slotCount = selectedSlots.length;
    
    let discount = 0;
    if (slotCount >= 3) {
      discount = 0.1; // 10% discount for 3+ slots
    } else if (slotCount === 2) {
      discount = 0.05; // 5% discount for 2 slots
    }
    
    const finalTotal = baseTotal * (1 - discount);
    return { baseTotal, discount, finalTotal, slotCount };
  };

  const { baseTotal, discount, finalTotal, slotCount } = calculateTotal();

  // Handle booking submission
  const handleSubmit = () => {
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất một khung giờ!');
      return;
    }

    if (onBookingSubmit) {
      onBookingSubmit(selectedSlots);
    } else {
      console.log('Selected slots:', selectedSlots);
      alert(`Đặt phòng thành công! Tổng tiền: ${finalTotal.toLocaleString('vi-VN')}đ`);
    }
  };

  // Get cell class based on status and selection
  const getCellClass = (dateKey: string, branchId: string, roomId: string, timeSlotId: string) => {
    const bookingStatus = getBookingStatus(dateKey, branchId, roomId, timeSlotId);
    const selected = isSelected(dateKey, branchId, roomId, timeSlotId);
    
    if (selected) return `${styles.cell} ${styles.selected}`;
    
    switch (bookingStatus.status) {
      case 'booked':
        return `${styles.cell} ${styles.booked}`;
      case 'promotion':
        return `${styles.cell} ${styles.promotion}`;
      case 'mystery':
        return `${styles.cell} ${styles.mystery}`;
      default:
        return `${styles.cell} ${styles.available}`;
    }
  };

  // Get cell content based on status
  const getCellContent = (dateKey: string, branchId: string, roomId: string, timeSlotId: string) => {
    const bookingStatus = getBookingStatus(dateKey, branchId, roomId, timeSlotId);
    const selected = isSelected(dateKey, branchId, roomId, timeSlotId);
    
    if (selected) return 'Đang chọn';
    
    switch (bookingStatus.status) {
      case 'booked':
        return 'Đã đặt';
      case 'promotion':
        return '🎁 Khuyến mãi';
      case 'mystery':
        return '🛍️ Túi mù';
      default:
        return 'Còn trống';
    }
  };

  return (
    <div className={styles.bookingTableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.bookingTable}>
          {/* Header */}
          <thead>
            {/* Branch names */}
            <tr className={styles.branchRow}>
              <th className={styles.dateHeader}>Ngày</th>
              {branches.map(branch => (
                <th 
                  key={branch.id} 
                  className={styles.branchHeader}
                  colSpan={branch.rooms.reduce((sum, room) => sum + room.timeSlots.length, 0)}
                >
                  {branch.name}
                </th>
              ))}
            </tr>
            
            {/* Room names */}
            <tr className={styles.roomRow}>
              <th className={styles.dateHeader}></th>
              {branches.map(branch =>
                branch.rooms.map(room => (
                  <th 
                    key={`${branch.id}-${room.id}`}
                    className={styles.roomHeader}
                    colSpan={room.timeSlots.length}
                  >
                    {room.name}
                  </th>
                ))
              )}
            </tr>
            
            {/* Time slots */}
            <tr className={styles.timeRow}>
              <th className={styles.dateHeader}>Khung giờ</th>
              {branches.map(branch =>
                branch.rooms.map(room =>
                  room.timeSlots.map(timeSlot => (
                    <th 
                      key={`${branch.id}-${room.id}-${timeSlot.id}`}
                      className={styles.timeHeader}
                    >
                      {timeSlot.time}
                    </th>
                  ))
                )
              )}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody>
            {dates.map(dateInfo => (
              <tr key={dateInfo.key} className={styles.dateRow}>
                <td className={styles.dateCell}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dayName}>{dateInfo.dayName}</span>
                    <span className={styles.dateString}>{dateInfo.dateString}</span>
                  </div>
                </td>
                {branches.map(branch =>
                  branch.rooms.map(room =>
                    room.timeSlots.map(timeSlot => (
                      <td 
                        key={`${dateInfo.key}-${branch.id}-${room.id}-${timeSlot.id}`}
                        className={getCellClass(dateInfo.key, branch.id, room.id, timeSlot.id)}
                        onClick={() => handleCellClick(dateInfo.key, branch.id, room.id, timeSlot)}
                      >
                        {getCellContent(dateInfo.key, branch.id, room.id, timeSlot.id)}
                      </td>
                    ))
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Price Summary */}
      {selectedSlots.length > 0 && (
        <div className={styles.priceSection}>
          <div className={styles.priceDetails}>
            <div className={styles.priceRow}>
              <span>Số khung giờ đã chọn:</span>
              <span>{slotCount}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Tổng tiền gốc:</span>
              <span>{baseTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            {discount > 0 && (
              <div className={styles.priceRow}>
                <span>Giảm giá ({(discount * 100)}%):</span>
                <span>-{(baseTotal * discount).toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className={`${styles.priceRow} ${styles.totalRow}`}>
              <span>Tổng thanh toán:</span>
              <span>{finalTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
          
          <button 
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            Đặt phòng ({slotCount} khung giờ)
          </button>
        </div>
      )}
    </div>
  );
} 