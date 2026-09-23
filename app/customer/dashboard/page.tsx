'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Star, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  MessageSquare,
  ArrowRight,
  LogIn,
  Phone
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { currentUser, role, switchRole, bookings, allProfiles, updateBookingStatus, addReview, reviews } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    } else if (role !== 'customer') {
      switchRole('customer');
    }
  }, [currentUser, role, router, switchRole]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-sm space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">คุณยังไม่ได้เข้าสู่ระบบ</h3>
          <p className="text-xs text-slate-500">กรุณาเข้าสู่ระบบก่อนเพื่อเข้าถึงแดชบอร์ดลูกค้า</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs">
            <LogIn className="w-4 h-4" />
            ไปยังหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  const customerBookings = bookings.filter(
    (b) => b.customer_id === currentUser.id
  );

  const activeBookings = customerBookings.filter(
    (b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress'
  );

  const historyBookings = customerBookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  // Cancel Modal State
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  const handleCancelBooking = (bookingId: string) => {
    setCancelBookingId(bookingId);
  };

  const handleConfirmCancel = () => {
    if (cancelBookingId) {
      updateBookingStatus(cancelBookingId, 'cancelled');
      setCancelBookingId(null);
    }
  };

  const handleOpenReviewModal = (booking: Booking) => {
    setReviewBooking(booking);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !currentUser) return;

    setIsSubmittingReview(true);
    try {
      await addReview({
        booking_id: reviewBooking.id,
        customer_id: currentUser.id,
        companion_id: reviewBooking.companion_id || '11111111-1111-1111-1111-111111111111',
        rating,
        comment,
      });
      setReviewBooking(null);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Customer Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
            {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'ค'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{currentUser?.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                ลูกค้า (Customer)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser?.email} • เบอร์ติดต่อ: {currentUser?.phone || '081-234-5678'}
            </p>
          </div>
        </div>

        <Link
          href="/bookings/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition shadow-md shadow-blue-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>สร้างคำขอบริการใหม่</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>คำขอที่กำลังดำเนินการ</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
            {activeBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ประวัติการใช้บริการที่เสร็จสิ้น</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {historyBookings.length}
          </span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activeBookings : historyBookings).length > 0 ? (
          (activeTab === 'active' ? activeBookings : historyBookings).map((booking) => {
            const companionProfile = booking.companion_id
              ? allProfiles.find((p) => p.id === booking.companion_id) || INITIAL_PROFILES[booking.companion_id]
              : null;
            const hasReviewed = reviews.some((r) => r.booking_id === booking.id);

            return (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{booking.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      รหัสคำขอ: #{booking.id.slice(-6).toUpperCase()} • สร้างเมื่อ:{' '}
                      {new Date(booking.created_at).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Date & Time */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      วันเวลาเดินทาง
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {booking.scheduled_date} เวลา {booking.scheduled_time} น.
                    </p>
                    <p className="text-slate-500">ระยะเวลา: {booking.duration_hours} ชม.</p>
                  </div>

                  {/* Route */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      เส้นทาง
                    </div>
                    <p className="text-slate-700 truncate">
                      <strong className="text-slate-900">ต้นทาง:</strong> {booking.origin_location}
                    </p>
                    <p className="text-slate-700 truncate">
                      <strong className="text-slate-900">ปลายทาง:</strong> {booking.destination_location}
                    </p>
                  </div>

                  {/* Companion & Cost */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      ผู้ร่วมเดินทาง & ค่าบริการ
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {companionProfile ? (
                        <span>🤝 {companionProfile.full_name}</span>
                      ) : (
                        <span className="text-amber-600">📢 รอผู้ช่วยในพื้นที่กดรับงาน</span>
                      )}
                    </p>
                    {companionProfile && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>โทร: </span>
                        {companionProfile.phone ? (
                          <a href={`tel:${companionProfile.phone}`} className="font-bold text-emerald-700 hover:underline">
                            {companionProfile.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">ยังไม่ได้ระบุ</span>
                        )}
                      </div>
                    )}
                    <p className="text-blue-600 font-bold">
                      ประมาณการ: ฿{booking.estimated_cost.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Special Notes if any */}
                {booking.special_notes && (
                  <div className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>ความต้องการพิเศษ:</strong> {booking.special_notes}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  {companionProfile?.phone && (booking.status === 'accepted' || booking.status === 'in_progress') && (
                    <a
                      href={`tel:${companionProfile.phone}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>โทรหาผู้ช่วย ({companionProfile.phone})</span>
                    </a>
                  )}

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                    >
                      ยกเลิกคำขอ
                    </button>
                  )}

                  {booking.status === 'completed' && !hasReviewed && (
                    <button
                      onClick={() => handleOpenReviewModal(booking)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      เขียนรีวิวและให้คะแนนดาว
                    </button>
                  )}

                  {booking.status === 'completed' && hasReviewed && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ให้คะแนนรีวิวแล้ว ขอบคุณครับ
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === 'active' ? 'ไม่มีคำขอที่กำลังดำเนินการ' : 'ยังไม่มีประวัติการใช้บริการ'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              คุณสามารถสร้างคำขอนัดหมายผู้ช่วยร่วมเดินทางได้ตลอดเวลา
            </p>
            <Link
              href="/bookings/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="w-4 h-4" />
              สร้างคำขอร่วมเดินทาง
            </Link>
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                รีวิวการให้บริการ
              </h3>
              <button
                onClick={() => setReviewBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">ธุระ:</p>
                <p className="text-sm font-bold text-slate-800">{reviewBooking.title}</p>
              </div>

              {/* Star Selector */}
              <div className="space-y-1 text-center">
                <label className="text-xs font-bold text-slate-700">ให้คะแนนความพึงพอใจ</label>
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-amber-600">
                  {rating === 5 && 'ยอดเยี่ยมมาก พึงพอใจที่สุด ⭐⭐⭐⭐⭐'}
                  {rating === 4 && 'ดีมาก สุภาพเรียบร้อย ⭐⭐⭐⭐'}
                  {rating === 3 && 'ปานกลาง พอใช้ได้ ⭐⭐⭐'}
                  {rating <= 2 && 'ต้องปรับปรุง ⭐⭐'}
                </p>
              </div>

              {/* Review Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ความคิดเห็นเพิ่มเติม</label>
                <textarea
                  rows={3}
                  required
                  placeholder="เล่าความประทับใจ เช่น ตรงต่อเวลา, ช่วยดูแลอย่างดี, ช่วยถือของ..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'กำลังบันทึก...' : 'ส่งรีวิว'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(cancelBookingId)}
        title="ยืนยันการยกเลิกคำขอ"
        message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอนี้? เมื่อกดยกเลิกแล้ว รายการจะถูกย้ายไปยังประวัติและไม่สามารถย้อนกลับได้"
        confirmText="ใช่, ยกเลิกคำขอ"
        cancelText="ไม่ยกเลิก"
        variant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelBookingId(null)}
      />
    </div>
  );
}
