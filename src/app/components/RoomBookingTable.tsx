'use client';

import { useState, useEffect, useRef } from 'react';
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
  onBookingSubmit?: (selectedSlots: SelectedSlot[]) => void;
  initialBookings?: Record<string, Record<string, Record<string, Record<string, BookingStatus>>>>;
  initialSelectedSlots?: SelectedSlot[];
  submitOnSelect?: boolean;
  isFullDayBooking?: boolean;
}

// SVG Icon Components
const AvailableIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 471.701 471.701" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M433.601,67.001c-24.7-24.7-57.4-38.2-92.3-38.2s-67.7,13.6-92.4,38.3l-12.9,12.9l-13.1-13.1 c-24.7-24.7-57.6-38.4-92.5-38.4c-34.8,0-67.6,13.6-92.2,38.2c-24.7,24.7-38.3,57.5-38.2,92.4c0,34.9,13.7,67.6,38.4,92.3 l187.8,187.8c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-3.9l188.2-187.5c24.7-24.7,38.3-57.5,38.3-92.4 C471.801,124.501,458.301,91.701,433.601,67.001z M414.401,232.701l-178.7,178l-178.3-178.3c-19.6-19.6-30.4-45.6-30.4-73.3 s10.7-53.7,30.3-73.2c19.5-19.5,45.5-30.3,73.1-30.3c27.7,0,53.8,10.8,73.4,30.4l22.6,22.6c5.3,5.3,13.8,5.3,19.1,0l22.4-22.4 c19.6-19.6,45.7-30.4,73.3-30.4c27.6,0,53.6,10.8,73.2,30.3c19.6,19.6,30.3,45.6,30.3,73.3 C444.801,187.101,434.001,213.101,414.401,232.701z" fill="#605f3a"/>
  </svg>
);

const BookedIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.3 5.71002C18.841 5.24601 18.2943 4.87797 17.6917 4.62731C17.0891 4.37666 16.4426 4.2484 15.79 4.25002C15.1373 4.2484 14.4909 4.37666 13.8883 4.62731C13.2857 4.87797 12.739 5.24601 12.28 5.71002L12 6.00002L11.72 5.72001C10.7917 4.79182 9.53273 4.27037 8.22 4.27037C6.90726 4.27037 5.64829 4.79182 4.72 5.72001C3.80386 6.65466 3.29071 7.91125 3.29071 9.22002C3.29071 10.5288 3.80386 11.7854 4.72 12.72L11.49 19.51C11.6306 19.6505 11.8212 19.7294 12.02 19.7294C12.2187 19.7294 12.4094 19.6505 12.55 19.51L19.32 12.72C20.2365 11.7823 20.7479 10.5221 20.7442 9.21092C20.7405 7.89973 20.2218 6.64248 19.3 5.71002Z" fill="#83311b"/>
  </svg>
);

const SelectedIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.3 5.71002C18.841 5.24601 18.2943 4.87797 17.6917 4.62731C17.0891 4.37666 16.4426 4.2484 15.79 4.25002C15.1373 4.2484 14.4909 4.37666 13.8883 4.62731C13.2857 4.87797 12.739 5.24601 12.28 5.71002L12 6.00002L11.72 5.72001C10.7917 4.79182 9.53273 4.27037 8.22 4.27037C6.90726 4.27037 5.64829 4.79182 4.72 5.72001C3.80386 6.65466 3.29071 7.91125 3.29071 9.22002C3.29071 10.5288 3.80386 11.7854 4.72 12.72L11.49 19.51C11.6306 19.6505 11.8212 19.7294 12.02 19.7294C12.2187 19.7294 12.4094 19.6505 12.55 19.51L19.32 12.72C20.2365 11.7823 20.7479 10.5221 20.7442 9.21092C20.7405 7.89973 20.2218 6.64248 19.3 5.71002Z" fill="#bd8049"/>
  </svg>
);

export default function RoomBookingTable({
  branches,
  startDate = new Date(),
  daysCount = 7,
  onBookingSubmit,
  initialBookings = {},
  initialSelectedSlots = [],
  submitOnSelect = false,
  isFullDayBooking = false
}: RoomBookingTableProps) {
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>(initialSelectedSlots);
  const [bookings] = useState(initialBookings);
  const [isMobile, setIsMobile] = useState(false);
  const isInitialMount = useRef(true);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update selected slots when initialSelectedSlots prop changes
  useEffect(() => {
    if (initialSelectedSlots.length > 0) {
      setSelectedSlots(initialSelectedSlots);
    }
  }, [initialSelectedSlots]);

  // Call onBookingSubmit whenever selectedSlots changes
  useEffect(() => {
    if (submitOnSelect && onBookingSubmit && !isInitialMount.current) {
      onBookingSubmit(selectedSlots);
    }
    isInitialMount.current = false;
  }, [selectedSlots, submitOnSelect]);

  // Get responsive icon size
  const getIconSize = () => {
    if (window.innerWidth <= 360) return 14;
    if (isMobile) return 16;
    return 24;
  };

  // Generate dates with compact format for mobile
  const generateDates = () => {
    const dates = [];
    const vietnameseDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayName = i === 0 ? 'Hôm nay' : vietnameseDays[date.getDay()];
      let dateString;
      if (window.innerWidth <= 360) {
        dateString = `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (isMobile) {
        dateString = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      } else {
        dateString = date.toLocaleDateString('vi-VN');
      }
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
    // Prevent manual selection when in full day booking mode
    if (isFullDayBooking) return;

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
        price: timeSlot.price
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
    const iconSize = getIconSize();
    
    if (selected) {
      return <SelectedIcon size={iconSize} />;
    }
    
    switch (bookingStatus.status) {
      case 'booked':
        return <BookedIcon size={iconSize} />;
      case 'available':
        return <AvailableIcon size={iconSize} />;
      case 'promotion':
        return <AvailableIcon size={iconSize} />;
      case 'mystery':
        return <AvailableIcon size={iconSize} />;
      default:
        return <AvailableIcon size={iconSize} />;
    }
  };

  return (
    <div className={styles.bookingTableContainer}>
      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <AvailableIcon size={getIconSize()} />
          <span>Còn trống</span>
        </div>
        <div className={styles.legendItem}>
          <SelectedIcon size={getIconSize()} />
          <span>Đang chọn</span>
        </div>
        <div className={styles.legendItem}>
          <BookedIcon size={getIconSize()} />
          <span>Đã đặt</span>
        </div>
      </div>
      
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
      {!isFullDayBooking && selectedSlots.length > 0 && (
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