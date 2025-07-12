'use client';

import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import RoomBookingTable from '../../components/RoomBookingTable';
import { getRoomBySlug, detailedBranches } from '../../data/bookingData';
import styles from './room.module.css';

interface BookingFormData {
  fullName: string;
  phone: string;
  email: string;
  cccd: string;
  guests: string;
  notes: string;
  paymentMethod: string;
}

interface SelectedSlot {
  date: string;
  branchId: string;
  roomId: string;
  timeSlotId: string;
  price: number;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomSlug = params.roomSlug as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [frontIdImage, setFrontIdImage] = useState<File | null>(null);
  const [backIdImage, setBackIdImage] = useState<File | null>(null);
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null);
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    email: '',
    cccd: '',
    guests: '',
    notes: '',
    paymentMethod: 'cash'
  });
  
  const room = getRoomBySlug(roomSlug);
  
  if (!room) {
    notFound();
  }

  // Filter branches to only include the current room
  const getCurrentRoomBranches = () => {
    // Find the branch that contains this room
    const currentBranch = detailedBranches.find(branch => 
      branch.rooms.some(r => r.id === room.id)
    );
    
    if (!currentBranch) {
      // If no branch found, create a mock branch with just this room
      return [{
        id: 'current-room-branch',
        name: room.location,
        rooms: [{
          id: room.id,
          name: room.name,
          timeSlots: room.timeSlots || [
            { id: 'morning', time: '9:30–12:30', price: 50000 },
            { id: 'afternoon', time: '13:00–16:00', price: 50000 },
            { id: 'evening', time: '16:30–19:30', price: 60000 },
          ]
        }]
      }];
    }
    
    // Return only the branch containing this room, but filter to only this room
    return [{
      ...currentBranch,
      rooms: currentBranch.rooms.filter(r => r.id === room.id)
    }];
  };

  const currentRoomBranches = getCurrentRoomBranches();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'front') {
          setFrontIdImage(file);
          setFrontIdPreview(result);
        } else {
          setBackIdImage(file);
          setBackIdPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingTableSubmit = (slots: SelectedSlot[]) => {
    setSelectedSlots(slots);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất một khung giờ từ bảng lịch đặt phòng!');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmBooking = () => {
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

    const { finalTotal } = calculateTotal();

    // Store booking data for payment page
    const bookingData = {
      ...formData,
      room: room.name,
      location: room.location,
      price: finalTotal,
      selectedSlots: selectedSlots,
      frontIdImage: frontIdImage?.name,
      backIdImage: backIdImage?.name
    };
    
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    router.push('/payment');
  };

  const handleEditInfo = () => {
    setShowConfirmation(false);
  };

  const formatSelectedSlots = () => {
    if (selectedSlots.length === 0) return 'Chưa chọn khung giờ';
    
    return selectedSlots.map(slot => {
      const date = new Date(slot.date).toLocaleDateString('vi-VN');
      const branch = currentRoomBranches.find(b => b.id === slot.branchId);
      const roomData = branch?.rooms.find(r => r.id === slot.roomId);
      const timeSlot = roomData?.timeSlots.find(ts => ts.id === slot.timeSlotId);
      
      return `${date} (${timeSlot?.time})`;
    }).join(', ');
  };

  const calculateTotalPrice = () => {
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

  const { baseTotal, discount, finalTotal, slotCount } = calculateTotalPrice();

  return (
    <div className={styles.page}>
      <Header />
      
      {/* Room Header */}
      <div className={styles.roomHeader}>
        <div className={styles.headerContent}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>Trang chủ</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{room.name}</span>
          </div>
          <h1 className={styles.roomTitle}>{room.name}</h1>
          <div className={styles.roomLocation}>📍 {room.location}</div>
        </div>
      </div>

      <div className={styles.roomContainer}>
        <div className={styles.roomMain}>
          {/* Room Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <div 
                className={styles.roomImage}
                style={{ 
                  background: room.images[selectedImageIndex] ? 
                    `url(${room.images[selectedImageIndex]})` : 
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
            <div className={styles.imageThumbnails}>
              {room.images.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.thumbnailActive : ''}`}
                  style={{ 
                    background: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Room Details */}
          <div className={styles.roomDetails}>
            <div className={styles.roomInfo}>
              <h2 className={styles.roomName}>{room.name}</h2>
              <div className={styles.roomRating}>
                <span className={styles.rating}>⭐ {room.rating}</span>
                <span className={styles.reviews}>({room.reviews} đánh giá)</span>
              </div>
              
              <div className={styles.roomSpecs}>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>👥</span>
                  <span className={styles.specText}>{room.capacity} khách</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>🏠</span>
                  <span className={styles.specText}>{room.bedrooms} phòng ngủ</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>🚿</span>
                  <span className={styles.specText}>{room.bathrooms} phòng tắm</span>
                </div>
                <div className={styles.spec}>
                  <span className={styles.specIcon}>📐</span>
                  <span className={styles.specText}>{room.area}</span>
                </div>
              </div>

              <div className={styles.pricing}>
                <div className={styles.priceMain}>
                  <span className={styles.currentPrice}>
                    {room.price.base.toLocaleString('vi-VN')} đ/tháng
                  </span>
                  <span className={styles.originalPrice}>
                    {room.price.originalPrice?.toLocaleString('vi-VN')} đ/tháng
                  </span>
                </div>
                <div className={styles.discountBadge}>
                  Tiết kiệm {room.price.discount}%
                </div>
              </div>

              <div className={styles.description}>
                <h3 className={styles.sectionTitle}>Mô tả</h3>
                <p className={styles.descriptionText}>{room.description}</p>
              </div>

              <div className={styles.features}>
                <h3 className={styles.sectionTitle}>Đặc điểm nổi bật</h3>
                <div className={styles.featureList}>
                  {room.features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <span className={styles.featureIcon}>✓</span>
                      <span className={styles.featureText}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.amenities}>
                <h3 className={styles.sectionTitle}>Tiện nghi</h3>
                <div className={styles.amenityGrid}>
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className={styles.amenityItem}>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.policies}>
                <h3 className={styles.sectionTitle}>Chính sách</h3>
                <div className={styles.policyList}>
                  <div className={styles.policyItem}>
                    <span className={styles.policyLabel}>Nhận phòng:</span>
                    <span className={styles.policyValue}>{room.checkIn}</span>
                  </div>
                  <div className={styles.policyItem}>
                    <span className={styles.policyLabel}>Trả phòng:</span>
                    <span className={styles.policyValue}>{room.checkOut}</span>
                  </div>
                  {room.policies.map((policy, index) => (
                    <div key={index} className={styles.policyItem}>
                      <span className={styles.policyIcon}>•</span>
                      <span className={styles.policyText}>{policy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Section */}
        <div className={styles.bookingSection}>
          <h2 className={styles.bookingTitle}>Thông tin Đặt phòng</h2>
          
          {/* Time Slot Selection Table */}
          <div className={styles.timeSlotSection}>
            <h3 className={styles.formSectionTitle}>Lịch đặt phòng thời gian thực</h3>
            <p className={styles.tableDescription}>Chọn khung giờ phù hợp với bạn</p>
            <RoomBookingTable
              branches={currentRoomBranches}
              onBookingSubmit={handleBookingTableSubmit}
              slotPrice={50000}
            />
          </div>

          <div className={styles.bookingForm}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Thông tin khách hàng</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Họ và tên *</label>
                    <input 
                      type="text" 
                      name="fullName"
                      className={styles.input} 
                      placeholder="Nhập họ và tên" 
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số điện thoại *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className={styles.input} 
                      placeholder="Nhập số điện thoại" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className={styles.input} 
                      placeholder="Nhập email" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CCCD/CMND *</label>
                    <input 
                      type="text" 
                      name="cccd"
                      className={styles.input} 
                      placeholder="Nhập số CCCD/CMND" 
                      value={formData.cccd}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Căn cước công dân</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mặt trước *</label>
                    <div className={`${styles.imageUpload} ${frontIdImage ? styles.uploaded : ''}`}>
                      <input 
                        type="file" 
                        className={styles.fileInput} 
                        accept="image/*" 
                        required 
                        onChange={(e) => handleFileUpload(e, 'front')}
                        aria-label="Tải lên ảnh mặt trước CCCD"
                      />
                      {frontIdPreview ? (
                        <div className={styles.imagePreview}>
                          <img src={frontIdPreview} alt="CCCD mặt trước" className={styles.previewImage} />
                          <div className={styles.previewOverlay}>
                            <span className={styles.fileName}>{frontIdImage?.name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <div className={styles.uploadIcon}>📷+</div>
                          <span className={styles.uploadText}>Mặt trước</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mặt sau *</label>
                    <div className={`${styles.imageUpload} ${backIdImage ? styles.uploaded : ''}`}>
                      <input 
                        type="file" 
                        className={styles.fileInput} 
                        accept="image/*" 
                        required 
                        onChange={(e) => handleFileUpload(e, 'back')}
                        aria-label="Tải lên ảnh mặt sau CCCD"
                      />
                      {backIdPreview ? (
                        <div className={styles.imagePreview}>
                          <img src={backIdPreview} alt="CCCD mặt sau" className={styles.previewImage} />
                          <div className={styles.previewOverlay}>
                            <span className={styles.fileName}>{backIdImage?.name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <div className={styles.uploadIcon}>📷+</div>
                          <span className={styles.uploadText}>Mặt sau</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.idCardNotice}>
                  <p className={styles.noticeText}>
                    * Thông tin CCCD của bạn được lưu trữ và bảo mật riêng tư để khai báo 
                    lưu trú, sẽ được xóa bỏ sau khi bạn check-out. Bạn vui lòng chọn đúng 
                    ảnh CCCD của người Đặt phòng và chịu trách nhiệm với thông tin trên.
                  </p>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Thông tin đặt phòng</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Khung giờ đã chọn</label>
                    <div className={styles.selectedSlotsDisplay}>
                      {formatSelectedSlots()}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Số lượng khách *</label>
                    <select 
                      name="guests"
                      className={styles.select} 
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn số lượng khách</option>
                      <option value="1">1 khách</option>
                      <option value="2">2 khách</option>
                      <option value="3">3 khách</option>
                      <option value="4">4 khách</option>
                      <option value="5">5+ khách</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ghi chú</label>
                    <input 
                      type="text" 
                      name="notes"
                      className={styles.input} 
                      placeholder="Yêu cầu đặc biệt (nếu có)" 
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Thông tin thanh toán</h3>
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Số khung giờ:</span>
                    <span>{slotCount}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Tổng tiền gốc:</span>
                    <span>{baseTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {discount > 0 && (
                    <div className={styles.priceRow}>
                      <span>Giảm giá ({(discount * 100).toFixed(0)}%):</span>
                      <span className={styles.discount}>
                        -{(baseTotal * discount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                  <div className={`${styles.priceRow} ${styles.totalRow}`}>
                    <span>Tổng thanh toán:</span>
                    <span className={styles.totalPrice}>{finalTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
                
                <div className={styles.paymentMethods}>
                  <h4 className={styles.paymentTitle}>Phương thức thanh toán</h4>
                  <div className={styles.paymentOptions}>
                    <label className={styles.paymentOption}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cash" 
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                      />
                      <span>Thanh toán tiền mặt khi nhận phòng</span>
                    </label>
                    <label className={styles.paymentOption}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="transfer" 
                        checked={formData.paymentMethod === 'transfer'}
                        onChange={handleInputChange}
                      />
                      <span>Chuyển khoản ngân hàng</span>
                    </label>
                    <label className={styles.paymentOption}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="card" 
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                      />
                      <span>Thanh toán bằng thẻ</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.termsSection}>
                  <label className={styles.termsLabel}>
                    <input type="checkbox" className={styles.checkbox} required />
                    <span>Tôi đã đọc và đồng ý với <a href="#" className={styles.link}>điều khoản sử dụng</a> và <a href="#" className={styles.link}>chính sách bảo mật</a></span>
                  </label>
                </div>
                
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    Xác nhận đặt phòng
                  </button>
                  <button type="button" className={styles.cancelButton}>
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationModal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Xác nhận đặt phòng</h2>
              <button 
                className={styles.closeButton}
                onClick={handleEditInfo}
                aria-label="Đóng modal"
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.bookingLocation}>
                <strong>Bạn đang đặt phòng tại:</strong>
                <span className={styles.locationText}>
                  {room.name} - {room.location}
                </span>
              </div>
              
              <div className={styles.bookingDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tên khách hàng:</span>
                  <span className={styles.detailValue}>{formData.fullName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Số điện thoại:</span>
                  <span className={styles.detailValue}>{formData.phone}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Chi nhánh:</span>
                  <span className={styles.detailValue}>{room.name} - {room.location}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tên phòng:</span>
                  <span className={styles.detailValue}>{room.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Khung giờ:</span>
                  <span className={styles.detailValue}>{formatSelectedSlots()}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Số tiền tạm tính:</span>
                  <span className={styles.detailValue}>
                    {finalTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
              
              <div className={styles.bookingNotice}>
                <strong>KHÁCH MUỐN BẢO LƯU HAY ĐỔI NGÀY VUI LÒNG BẢO TRƯỚC 3 TIẾNG TRƯỚC GIỜ CHECK IN</strong>
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  className={styles.editButton}
                  onClick={handleEditInfo}
                >
                  Sửa lại thông tin
                </button>
                <button 
                  className={styles.confirmButton}
                  onClick={handleConfirmBooking}
                >
                  Đặt phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 