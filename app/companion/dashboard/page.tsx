'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import StatusBadge from '@/components/StatusBadge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Navigation, 
  DollarSign, 
  Star, 
  ShieldCheck, 
  Settings,
  Power,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function CompanionDashboardPage() {
  const router = useRouter();
  const { 
    currentUser, 
    companions, 
    bookings, 
    acceptBooking, 
    updateBookingStatus, 
    toggleCompanionAvailability 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'active_jobs' | 'history'>('requests');

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-sm space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">คุณยังไม่ได้เข้าสู่ระบบ</h3>
          <p className="text-xs text-slate-500">กรุณาเข้าสู่ระบบก่อนเพื่อเข้าถึงแดชบอร์ดผู้ร่วมเดินทาง</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
            <LogIn className="w-4 h-4" />
            ไปยังหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  // Match companion profile
  const companionId = currentUser.id;
  const companionProfile = companions.find((c) => c.id === companionId) || companions[0];
  const userDetails = INITIAL_PROFILES[companionProfile.id] || currentUser;

  // Filter Bookings
  // 1. Requests: Pending jobs directed to this companion OR open jobs (companion_id is null)
  const pendingRequests = bookings.filter(
    (b) => b.status === 'pending' && (b.companion_id === companionProfile.id || !b.companion_id)
  );

  // 2. Active Jobs: Jobs accepted by this companion or currently in progress
  const activeJobs = bookings.filter(
    (b) => b.companion_id === companionProfile.id && (b.status === 'accepted' || b.status === 'in_progress')
  );

  // 3. Completed Jobs History
  const completedJobs = bookings.filter(
    (b) => b.companion_id === companionProfile.id && b.status === 'completed'
  );

  // Calculate earnings
  const totalEarnings = completedJobs.reduce((sum, b) => sum + b.estimated_cost, 0);

  const handleAccept = (bookingId: string) => {
    acceptBooking(bookingId, companionProfile.id);
  };

  const handleDecline = (bookingId: string) => {
    if (confirm('คุณต้องการปฏิเสธคำขอนี้ใช่หรือไม่?')) {
      updateBookingStatus(bookingId, 'cancelled');
    }
  };

  const handleStartTrip = (bookingId: string) => {
    updateBookingStatus(bookingId, 'in_progress');
  };

  const handleCompleteTrip = (bookingId: string) => {
    if (confirm('ยืนยันว่าการเดินทางและทำธุระเสร็จสิ้นเรียบร้อยแล้ว?')) {
      updateBookingStatus(bookingId, 'completed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Companion Stats & Status Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/20">
            {userDetails?.full_name ? userDetails.full_name.charAt(0) : 'ป'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{userDetails?.full_name}</h1>
              {companionProfile.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {companionProfile.rating_avg.toFixed(1)} ({companionProfile.rating_count} รีวิว)
              </span>
              <span>•</span>
              <span>ค่าบริการ: ฿{companionProfile.hourly_rate}/ชม.</span>
              <span>•</span>
              <span>ประสบการณ์ {companionProfile.experience_years} ปี</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Toggle */}
          <button
            onClick={() => toggleCompanionAvailability(companionProfile.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition ${
              companionProfile.is_available
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>สถานะ: {companionProfile.is_available ? 'พร้อมรับงาน' : 'พักรับงาน'}</span>
          </button>

          <Link
            href="/companion/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>แก้ไขข้อมูลบริการ</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">คำขอใหม่ที่รอการตอบรับ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{pendingRequests.length} รายการ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">งานที่อยู่ระหว่างดำเนินการ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeJobs.length} รายการ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">รายได้สะสม (งานที่เสร็จสิ้น)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ฿{totalEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>คำขอร่วมเดินทางใหม่</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active_jobs')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'active_jobs'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>งานที่กำลังปฏิบัติการ</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
            {activeJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ประวัติงานที่สำเร็จแล้ว</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {completedJobs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((booking) => {
              const customer = INITIAL_PROFILES[booking.customer_id];
              const isDirect = booking.companion_id === companionProfile.id;

              return (
                <div
                  key={booking.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{booking.title}</h3>
                        {isDirect ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            ⭐ ลูกค้าระบุตัวคุณโดยตรง
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            📢 คำขอเปิดรับทั่วไปในพื้นที่
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ผู้จอง: {customer?.full_name || 'ลูกค้า Care Companion'} • เบอร์โทร: {customer?.phone || '081-xxx-xxxx'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">ค่าบริการที่จะได้รับ</span>
                      <p className="text-lg font-black text-emerald-600">
                        ฿{booking.estimated_cost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700">วันเวลา:</p>
                      <p className="text-slate-900">
                        {booking.scheduled_date} เวลา {booking.scheduled_time} น. ({booking.duration_hours} ชม.)
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">จุดรับ - ปลายทาง:</p>
                      <p className="text-slate-900 truncate">
                        {booking.origin_location} ➔ {booking.destination_location}
                      </p>
                    </div>
                  </div>

                  {booking.special_notes && (
                    <p className="text-xs text-slate-600 bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                      <strong>หมายเหตุเพิ่มเติม:</strong> {booking.special_notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleDecline(booking.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      ปฏิเสธ
                    </button>
                    <button
                      onClick={() => handleAccept(booking.id)}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ตอบรับเป็นผู้ร่วมเดินทาง</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              ไม่มีคำขอใหม่ในขณะนี้ เมื่อมีลูกค้าขอรับบริการจะปรากฏที่นี่ทันที
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Active Tasks with Status Updates */}
      {activeTab === 'active_jobs' && (
        <div className="space-y-4">
          {activeJobs.length > 0 ? (
            activeJobs.map((booking) => {
              const customer = INITIAL_PROFILES[booking.customer_id];

              return (
                <div
                  key={booking.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{booking.title}</h3>
                      <p className="text-xs text-slate-500">
                        ลูกค้า: {customer?.full_name} • โทร: {customer?.phone}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-700">นัดหมาย:</p>
                      <p className="text-slate-900 font-medium">
                        {booking.scheduled_date} เวลา {booking.scheduled_time} น.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">สถานที่:</p>
                      <p className="text-slate-900 font-medium truncate">
                        {booking.origin_location} ➔ {booking.destination_location}
                      </p>
                    </div>
                  </div>

                  {/* Flow buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => handleStartTrip(booking.id)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>เริ่มการเดินทาง / ไปพบลูกค้า</span>
                      </button>
                    )}

                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteTrip(booking.id)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>สิ้นสุดบริการและส่งลูกค้าเรียบร้อย</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              ไม่มีงานที่กำลังปฏิบัติการอยู่ในขณะนี้
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Completed History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {completedJobs.length > 0 ? (
            completedJobs.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{booking.title}</h4>
                  <p className="text-slate-500">
                    เสร็จสิ้นเมื่อ: {booking.scheduled_date} • เส้นทาง: {booking.origin_location} ➔{' '}
                    {booking.destination_location}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 text-sm">
                    +฿{booking.estimated_cost.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400">สำเร็จ</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              ยังไม่มีประวัติงานที่เสร็จสิ้น
            </div>
          )}
        </div>
      )}
    </div>
  );
}
