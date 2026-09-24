'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  CheckCircle2, 
  XCircle, 
  Navigation, 
  DollarSign, 
  Star, 
  ShieldCheck, 
  Settings, 
  Power, 
  AlertCircle, 
  LogIn, 
  Phone, 
  Ban, 
  HeartPulse, 
  ShieldAlert,
  Eye,
  FileText,
  X,
  Activity,
  Compass,
  Users
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function CompanionDashboardPage() {
  const router = useRouter();
  const { 
    currentUser, 
    role,
    switchRole,
    companions, 
    bookings, 
    allProfiles,
    categories,
    acceptBooking, 
    updateBookingStatus, 
    toggleCompanionAvailability 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'active_jobs' | 'history'>('requests');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    } else if (role !== 'companion') {
      switchRole('companion');
    }
  }, [currentUser, role, router, switchRole]);

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

  // Match companion profile for current user
  const companionId = currentUser.id;
  const companionProfile = companions.find((c) => c.id === companionId) || {
    id: currentUser.id,
    bio: 'ผู้ช่วยร่วมเดินทางพร้อมให้บริการ',
    experience_years: 2,
    skills: ['เข็นรถเข็นผู้สูงอายุ', 'คุ้นเคยระบบโรงพยาบาล', 'ปฐมพยาบาลเบื้องต้น'],
    service_areas: ['กรุงเทพฯ และปริมณฑล'],
    hourly_rate: 250,
    is_verified: false,
    is_available: true,
    rating_avg: 5.0,
    rating_count: 1,
    profile: currentUser,
  };
  const userDetails = allProfiles.find((p) => p.id === currentUser.id) || currentUser;

  // Filter Bookings
  // 1. Requests: Pending jobs directed to this companion OR open jobs (companion_id is null)
  const pendingRequests = bookings.filter(
    (b) => b.status === 'pending' && (b.companion_id === currentUser.id || !b.companion_id)
  );

  // 2. Active Jobs: Jobs accepted by this companion or currently in progress
  const activeJobs = bookings.filter(
    (b) => b.companion_id === currentUser.id && (b.status === 'accepted' || b.status === 'in_progress')
  );

  // 3. Completed Jobs History
  const completedJobs = bookings.filter(
    (b) => b.companion_id === currentUser.id && b.status === 'completed'
  );

  // Calculate earnings
  const totalEarnings = completedJobs.reduce((sum, b) => sum + b.estimated_cost, 0);

  // Modal Dialog Config
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'success' | 'primary';
    isAlertOnly?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleAccept = (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking && currentUser && targetBooking.customer_id === currentUser.id) {
      setModalConfig({
        isOpen: true,
        title: 'ไม่สามารถรับงานของตนเองได้',
        message: 'คุณเป็นผู้สร้างคำขอบริการนี้ในฐานะผู้ว่าจ้าง ระบบไม่อนุญาตให้ผู้ว่าจ้างกดตอบรับงานของตนเองครับ',
        confirmText: 'เข้าใจแล้ว',
        variant: 'warning',
        isAlertOnly: true,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    if (!companionProfile.is_verified) {
      setModalConfig({
        isOpen: true,
        title: 'รอการอนุมัติจากผู้ดูแลระบบ',
        message: 'บัญชีผู้ร่วมเดินทางของคุณยังไม่ได้รับการอนุมัติจากแอดมิน จึงไม่สามารถรับงานได้ในขณะนี้ กรุณารอแอดมินตรวจสอบและอนุมัติเข้าทำงานก่อนครับ',
        confirmText: 'รับทราบ',
        variant: 'warning',
        isAlertOnly: true,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }
    acceptBooking(bookingId, currentUser.id);
  };

  const handleDecline = (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking && currentUser && targetBooking.customer_id === currentUser.id) {
      setModalConfig({
        isOpen: true,
        title: 'คำขอนี้สร้างโดยตัวคุณเอง',
        message: 'คุณเป็นผู้สร้างคำขอนี้ในฐานะผู้ว่าจ้าง หากต้องการยกเลิกคำขอ กรุณาไปยกเลิกที่หน้าแดชบอร์ดลูกค้าครับ',
        confirmText: 'ไปยังหน้าลูกค้า',
        cancelText: 'ปิด',
        variant: 'warning',
        isAlertOnly: false,
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          router.push('/customer/dashboard');
        },
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธคำขอ',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธคำขอนี้? สถานะคำขอจะถูกเปลี่ยนเป็นยกเลิก',
      confirmText: 'ใช่, ปฏิเสธคำขอ',
      cancelText: 'ย้อนกลับ',
      variant: 'danger',
      isAlertOnly: false,
      onConfirm: () => {
        updateBookingStatus(bookingId, 'cancelled');
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleStartTrip = (bookingId: string) => {
    updateBookingStatus(bookingId, 'in_progress');
  };

  const handleCompleteTrip = (bookingId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'ยืนยันการสิ้นสุดการเดินทาง',
      message: 'ยืนยันว่าการเดินทางและช่วยเหลือทำธุระเสร็จสิ้นเรียบร้อยแล้วใช่หรือไม่? ระบบจะบันทึกสถานะเป็นสำเร็จและให้ลูกค้าสามารถเขียนรีวิวได้',
      confirmText: 'ใช่, เสร็จสิ้นเรียบร้อย',
      cancelText: 'ยังไม่เสร็จ',
      variant: 'success',
      isAlertOnly: false,
      onConfirm: () => {
        updateBookingStatus(bookingId, 'completed');
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Verification Warning Alert Banner */}
      {!companionProfile.is_verified && (
        <div className="p-5 rounded-3xl bg-amber-50/90 border border-amber-200/80 text-amber-900 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-900">
              สถานะบัญชี: รอผู้ดูแลระบบ (Admin) อนุมัติและรับรองประวัติ
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              บัญชีผู้ร่วมเดินทางของคุณยังไม่ได้รับการอนุมัติจากแอดมิน คุณสามารถดูรายละเอียดคำขอและแก้ไขข้อมูลบริการได้ แต่จะ<strong>ยังไม่สามารถกดรับงานได้</strong>จนกว่าแอดมินจะกดอนุมัติเข้าทำงานในระบบ
            </p>
          </div>
        </div>
      )}

      {/* Companion Stats & Status Banner */}
      <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/20 shrink-0">
            {userDetails?.full_name ? userDetails.full_name.charAt(0) : 'ป'}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{userDetails?.full_name}</h1>
              {companionProfile.is_verified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  อนุมัติแล้ว (Verified)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  รอการอนุมัติ (Pending)
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {companionProfile.rating_avg.toFixed(1)} ({companionProfile.rating_count} รีวิว)
              </span>
              <span>•</span>
              <span>ค่าบริการ: ฿{companionProfile.hourly_rate}/ชม.</span>
              <span>•</span>
              <span>ประสบการณ์ {companionProfile.experience_years} ปี</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 mt-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>เบอร์ติดต่อของคุณ:</span>
              {userDetails?.phone ? (
                <span className="font-bold text-slate-800">{userDetails.phone}</span>
              ) : (
                <Link href="/companion/profile" className="text-amber-600 font-semibold hover:underline">
                  (ยังไม่ได้ระบุเบอร์โทร - คลิกเพื่อเพิ่ม)
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Availability Toggle */}
          <button
            onClick={() => toggleCompanionAvailability(companionProfile.id)}
            className={`min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition cursor-pointer ${
              companionProfile.is_available
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>สถานะ: {companionProfile.is_available ? 'พร้อมรับงาน' : 'พักรับงาน'}</span>
          </button>

          <Link
            href="/companion/profile"
            className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>แก้ไขข้อมูลบริการ</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">คำขอใหม่ที่รอการตอบรับ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{pendingRequests.length} รายการ</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">งานที่อยู่ระหว่างดำเนินการ</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeJobs.length} รายการ</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">รายได้สะสม (งานที่เสร็จสิ้น)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ฿{totalEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs - Smooth horizontal scroll on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => setActiveTab('requests')}
          className={`shrink-0 min-h-[44px] pb-2 px-3 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
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
          className={`shrink-0 min-h-[44px] pb-2 px-3 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
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
          className={`shrink-0 min-h-[44px] pb-2 px-3 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ประวัติงานที่สำเร็จแล้ว</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
            {completedJobs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((booking) => {
              const customer = allProfiles.find((p) => p.id === booking.customer_id) || INITIAL_PROFILES[booking.customer_id];
              const category = categories.find((c) => c.id === booking.service_category_id);
              const isDirect = booking.companion_id === currentUser.id;
              const isSelf = Boolean(currentUser && booking.customer_id === currentUser.id);

              return (
                <div
                  key={booking.id}
                  className={`p-6 rounded-3xl border transition space-y-4 ${
                    isSelf 
                      ? 'bg-amber-50/20 border-amber-200/90 shadow-2xs' 
                      : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{booking.title}</h3>
                        {category && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {category.name}
                          </span>
                        )}
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            👤 คำขอของคุณเอง
                          </span>
                        )}
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
                        ผู้จอง: {customer?.full_name || 'ลูกค้า Care Companion'} {isSelf ? '(คุณ)' : ''} • เบอร์โทร: {customer?.phone || '081-xxx-xxxx'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">ค่าบริการที่จะได้รับ</span>
                      <p className="text-lg font-black text-emerald-600">
                        ฿{booking.estimated_cost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isSelf && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start sm:items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                      <div>
                        <span className="font-bold">คุณเป็นผู้สร้างคำขอนี้ในฐานะผู้ว่าจ้าง:</span>{' '}
                        <span>ระบบไม่อนุญาตให้กดรับงานของตนเอง (คำขอนี้กำลังเปิดให้ผู้ร่วมเดินทางท่านอื่นในพื้นที่กดรับงาน)</span>
                      </div>
                    </div>
                  )}

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

                  {/* Customer Errand Details */}
                  {booking.description && (
                    <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>รายละเอียดคำขอจากลูกค้า:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{booking.description}</p>
                    </div>
                  )}

                  {/* Passenger & Emergency Care Requirements */}
                  {(booking.passenger_name || booking.passenger_age || booking.emergency_contact_phone || booking.mobility_level) && (
                    <div className="text-xs bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-700" />
                          ผู้รับบริการ: {booking.passenger_name || 'ลูกค้า'}
                          {booking.passenger_age ? ` (อายุ ${booking.passenger_age} ปี)` : ''}
                        </span>
                        {booking.is_for_other && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            จองให้ผู้อื่น
                          </span>
                        )}
                        {booking.mobility_level && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-emerald-200 text-emerald-800">
                            {booking.mobility_level === 'wheelchair' && '♿ นั่งวีลแชร์'}
                            {booking.mobility_level === 'needs_cane' && '🦯 ใช้ไม้เท้า/ช่วยพยุง'}
                            {booking.mobility_level === 'independent' && '🚶 เดินคล่องปกติ'}
                            {booking.mobility_level === 'bedridden' && '🛏️ ดูแลใกล้ชิด'}
                          </span>
                        )}
                      </div>

                      {booking.emergency_contact_phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 shrink-0">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>ติดต่อฉุกเฉิน:</span>
                          <a href={`tel:${booking.emergency_contact_phone}`} className="font-bold text-rose-700 hover:underline">
                            {booking.emergency_contact_name ? `${booking.emergency_contact_name} ` : ''}({booking.emergency_contact_phone})
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Medical Notes if any */}
                  {booking.medical_notes && (
                    <div className="text-xs text-slate-700 bg-rose-50/60 p-3 rounded-xl border border-rose-100 flex items-start gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-rose-900">ข้อมูลสุขภาพ/ยา:</strong> {booking.medical_notes}
                      </span>
                    </div>
                  )}

                  {booking.special_notes && (
                    <p className="text-xs text-slate-600 bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                      <strong>หมายเหตุเพิ่มเติม:</strong> {booking.special_notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingDetails(booking)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <span>ดูข้อมูลรายละเอียดคำขอ</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {isSelf ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <Link
                            href="/customer/dashboard"
                            className="min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition text-center"
                          >
                            จัดการคำขอในหน้าแดชบอร์ดลูกค้า
                          </Link>
                          <button
                            disabled
                            type="button"
                            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
                            title="คุณไม่สามารถตอบรับงานที่ตนเองเป็นผู้ว่าจ้างได้"
                          >
                            <Ban className="w-3.5 h-3.5 text-slate-400" />
                            <span>ไม่สามารถรับงานของตนเองได้</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDecline(booking.id)}
                            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
                          >
                            ปฏิเสธ
                          </button>
                          {companionProfile.is_verified ? (
                            <button
                              type="button"
                              onClick={() => handleAccept(booking.id)}
                              className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>ตอบรับเป็นผู้ร่วมเดินทาง</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              type="button"
                              className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
                              title="ต้องได้รับการอนุมัติจากแอดมินก่อนจึงจะรับงานได้"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span>รอแอดมินอนุมัติเข้างานก่อน</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
              const customer = allProfiles.find((p) => p.id === booking.customer_id) || INITIAL_PROFILES[booking.customer_id];
              const category = categories.find((c) => c.id === booking.service_category_id);

              return (
                <div
                  key={booking.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{booking.title}</h3>
                        {category && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
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

                  {/* Customer Errand Details */}
                  {booking.description && (
                    <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>รายละเอียดคำขอจากลูกค้า:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{booking.description}</p>
                    </div>
                  )}

                  {/* Passenger & Emergency Care Requirements */}
                  {(booking.passenger_name || booking.passenger_age || booking.emergency_contact_phone || booking.mobility_level) && (
                    <div className="text-xs bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-700" />
                          ผู้รับบริการ: {booking.passenger_name || 'ลูกค้า'}
                          {booking.passenger_age ? ` (อายุ ${booking.passenger_age} ปี)` : ''}
                        </span>
                        {booking.is_for_other && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            จองให้ผู้อื่น
                          </span>
                        )}
                        {booking.mobility_level && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-emerald-200 text-emerald-800">
                            {booking.mobility_level === 'wheelchair' && '♿ นั่งวีลแชร์'}
                            {booking.mobility_level === 'needs_cane' && '🦯 ใช้ไม้เท้า/ช่วยพยุง'}
                            {booking.mobility_level === 'independent' && '🚶 เดินคล่องปกติ'}
                            {booking.mobility_level === 'bedridden' && '🛏️ ดูแลใกล้ชิด'}
                          </span>
                        )}
                      </div>

                      {booking.emergency_contact_phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 shrink-0">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>ติดต่อฉุกเฉิน:</span>
                          <a href={`tel:${booking.emergency_contact_phone}`} className="font-bold text-rose-700 hover:underline">
                            {booking.emergency_contact_name ? `${booking.emergency_contact_name} ` : ''}({booking.emergency_contact_phone})
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Medical Notes if any */}
                  {booking.medical_notes && (
                    <div className="text-xs text-slate-700 bg-rose-50/60 p-3 rounded-xl border border-rose-100 flex items-start gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-rose-900">ข้อมูลสุขภาพ/ยา:</strong> {booking.medical_notes}
                      </span>
                    </div>
                  )}

                  {booking.special_notes && (
                    <p className="text-xs text-slate-600 bg-amber-50/70 p-3 rounded-xl border border-amber-100">
                      <strong>หมายเหตุเพิ่มเติม:</strong> {booking.special_notes}
                    </p>
                  )}

                  {/* Flow buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingDetails(booking)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <span>ดูข้อมูลรายละเอียดคำขอ</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {booking.status === 'accepted' && (
                        <button
                          type="button"
                          onClick={() => handleStartTrip(booking.id)}
                          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>เริ่มการเดินทาง / ไปพบลูกค้า</span>
                        </button>
                      )}

                      {booking.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleCompleteTrip(booking.id)}
                          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>สิ้นสุดบริการและส่งลูกค้าเรียบร้อย</span>
                        </button>
                      )}
                    </div>
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
                className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{booking.title}</h4>
                  <p className="text-slate-500">
                    เสร็จสิ้นเมื่อ: {booking.scheduled_date} • เส้นทาง: {booking.origin_location} ➔{' '}
                    {booking.destination_location}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-sm">
                      +฿{booking.estimated_cost.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">สำเร็จ</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBookingDetails(booking)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>ดูรายละเอียด</span>
                  </button>
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

      {/* Full Request Details Modal */}
      {selectedBookingDetails && (() => {
        const b = selectedBookingDetails;
        const bCustomer = allProfiles.find((p) => p.id === b.customer_id) || INITIAL_PROFILES[b.customer_id];
        const bCategory = categories.find((c) => c.id === b.service_category_id);
        const isSelf = Boolean(currentUser && b.customer_id === currentUser.id);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {bCategory && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {bCategory.name}
                      </span>
                    )}
                    <StatusBadge status={b.status} />
                    {b.is_for_other && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        จองให้ผู้อื่น
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">{b.title}</h2>
                  <p className="text-xs text-slate-500">
                    รหัสคำขอ: #{b.id.slice(0, 8)} • ส่งคำขอเมื่อ {b.created_at ? new Date(b.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ไม่ระบุ'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBookingDetails(null)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0 cursor-pointer"
                  aria-label="ปิด"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-6 text-slate-800">
                {/* Section 1: Errand Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    รายละเอียดงานและธุระที่ลูกค้าต้องการให้ช่วย
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {b.description || 'ไม่ได้ระบุรายละเอียดเพิ่มเติม'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">ระยะเวลาโดยประมาณ:</span>{' '}
                        <strong className="text-slate-800">{b.duration_hours} ชั่วโมง</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">ค่าบริการสุทธิที่จะได้รับ:</span>{' '}
                        <strong className="text-emerald-600 font-bold">฿{b.estimated_cost.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Customer & Passenger Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    ข้อมูลผู้ว่าจ้างและผู้รับบริการ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Customer Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <span className="font-bold text-slate-500 block text-[11px]">ข้อมูลผู้ว่าจ้าง (ผู้ติดต่อหลัก)</span>
                      <p className="font-bold text-slate-900 text-sm">{bCustomer?.full_name || 'ลูกค้า Care Companion'}</p>
                      {bCustomer?.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <a href={`tel:${bCustomer.phone}`} className="font-bold text-emerald-600 hover:underline">
                            {bCustomer.phone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">ไม่ได้ระบุเบอร์โทร</span>
                      )}
                      {bCustomer?.email && (
                        <p className="text-slate-500 text-[11px] truncate">อีเมล: {bCustomer.email}</p>
                      )}
                    </div>

                    {/* Passenger Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <span className="font-bold text-slate-500 block text-[11px]">ข้อมูลผู้เดินทาง / ผู้รับบริการ</span>
                      <p className="font-bold text-slate-900 text-sm">
                        {b.passenger_name || bCustomer?.full_name || 'ลูกค้า'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-slate-600">
                        <span>อายุ: <strong className="text-slate-800">{b.passenger_age ? `${b.passenger_age} ปี` : 'ไม่ได้ระบุ'}</strong></span>
                        <span>•</span>
                        <span>เพศ: <strong className="text-slate-800">{b.passenger_gender || 'ไม่ได้ระบุ'}</strong></span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        สถานะ: {b.is_for_other ? 'ผู้ว่าจ้างจองให้ผู้อื่น' : 'ผู้ว่าจ้างเดินทางด้วยตนเอง'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Health & Care & Emergency Contact */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    สภาพร่างกายและการช่วยเหลือพิเศษ
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                      <span className="text-slate-600">ความพร้อมทางร่างกาย (Mobility):</span>
                      <span className="font-bold text-slate-800">
                        {b.mobility_level === 'wheelchair' && '♿ นั่งวีลแชร์ (ต้องช่วยพยุงและเข็น)'}
                        {b.mobility_level === 'needs_cane' && '🦯 ใช้ไม้เท้า / ต้องช่วยพยุงเดิน'}
                        {b.mobility_level === 'independent' && '🚶 เดินได้คล่องตัวตามปกติ'}
                        {b.mobility_level === 'bedridden' && '🛏️ ติดเตียง / ต้องการการดูแลใกล้ชิด'}
                        {(!b.mobility_level || b.mobility_level === 'other') && 'ทั่วไป'}
                      </span>
                    </div>

                    {/* Emergency Contact */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                      <span className="text-slate-600 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        ผู้ติดต่อกรณีฉุกเฉิน:
                      </span>
                      {b.emergency_contact_phone ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {b.emergency_contact_name || 'ผู้ติดต่อฉุกเฉิน'}
                          </span>
                          <a
                            href={`tel:${b.emergency_contact_phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100"
                          >
                            <Phone className="w-3 h-3" />
                            {b.emergency_contact_phone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">ไม่ได้ระบุ</span>
                      )}
                    </div>

                    {/* Medical Notes */}
                    <div>
                      <span className="font-bold text-rose-800 block mb-1 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                        โรคประจำตัว / ยาที่ต้องรับประทาน / อาการที่ต้องระวัง:
                      </span>
                      <p className="text-slate-700 bg-white p-3 rounded-xl border border-rose-100 whitespace-pre-wrap leading-relaxed">
                        {b.medical_notes || 'ไม่มีข้อมูลโรคประจำตัวหรือยาพิเศษ'}
                      </p>
                    </div>

                    {/* Special Notes */}
                    {b.special_notes && (
                      <div>
                        <span className="font-bold text-amber-800 block mb-1">
                          หมายเหตุหรือคำแนะนำเพิ่มเติมจากลูกค้า:
                        </span>
                        <p className="text-slate-700 bg-white p-3 rounded-xl border border-amber-100 whitespace-pre-wrap leading-relaxed">
                          {b.special_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Travel & Route */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    การเดินทางและเวลานัดหมาย
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                      <div>
                        <span className="text-slate-500">วันนัดหมาย:</span>{' '}
                        <strong className="text-slate-900">{b.scheduled_date}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">เวลา:</span>{' '}
                        <strong className="text-slate-900">{b.scheduled_time} น.</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold block">จุดรับ (ต้นทาง):</span>
                          <span className="text-slate-900 font-medium">{b.origin_location}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold block">ปลายทาง:</span>
                          <span className="text-slate-900 font-medium">{b.destination_location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(b.origin_location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition text-[11px]"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>เปิด Google Maps นำทางไปจุดรับ</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBookingDetails(null)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {b.status === 'pending' && !isSelf && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookingDetails(null);
                          handleDecline(b.id);
                        }}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition cursor-pointer"
                      >
                        ปฏิเสธคำขอ
                      </button>
                      {companionProfile.is_verified ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingDetails(null);
                            handleAccept(b.id);
                          }}
                          className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ตอบรับงานนี้</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          type="button"
                          className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>รอแอดมินอนุมัติก่อน</span>
                        </button>
                      )}
                    </>
                  )}

                  {b.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBookingDetails(null);
                        handleStartTrip(b.id);
                      }}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>เริ่มการเดินทาง / ไปพบลูกค้า</span>
                    </button>
                  )}

                  {b.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBookingDetails(null);
                        handleCompleteTrip(b.id);
                      }}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>สิ้นสุดบริการและส่งลูกค้าเรียบร้อย</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Action Confirmation & Alert Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        variant={modalConfig.variant}
        isAlertOnly={modalConfig.isAlertOnly}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
