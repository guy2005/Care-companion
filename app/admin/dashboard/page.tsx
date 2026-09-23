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
  ShieldCheck, 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Star, 
  TrendingUp,
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Clock,
  AlertCircle,
  LogIn,
  Phone
} from 'lucide-react';
import { BookingStatus } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { 
    currentUser, 
    role,
    switchRole,
    companions, 
    bookings, 
    allProfiles,
    toggleCompanionVerification, 
    updateBookingStatus 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'verification' | 'bookings' | 'users'>('verification');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    } else if (role !== 'admin') {
      switchRole('admin');
    }
  }, [currentUser, role, router, switchRole]);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-sm space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-purple-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">คุณยังไม่ได้เข้าสู่ระบบ</h3>
          <p className="text-xs text-slate-500">กรุณาเข้าสู่ระบบก่อนเพื่อเข้าถึงแดชบอร์ดผู้ดูแลระบบ</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs">
            <LogIn className="w-4 h-4" />
            ไปยังหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  // Calculations
  const totalUsers = allProfiles.length > 0 ? allProfiles.length : Object.keys(INITIAL_PROFILES).length;
  const verifiedCompanionsCount = companions.filter((c) => c.is_verified).length;
  const totalBookingsCount = bookings.length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'completed').length;
  const totalPlatformVolume = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.estimated_cost, 0);

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(kw);
      const matchOrigin = b.origin_location.toLowerCase().includes(kw);
      const matchDest = b.destination_location.toLowerCase().includes(kw);
      if (!matchTitle && !matchOrigin && !matchDest) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4" />
            แผงควบคุมระบบส่วนกลาง (Admin Console)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            ภาพรวมและบริหารจัดการ Care Companion
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            ตรวจสอบความปลอดภัย อนุมัติผู้ร่วมเดินทาง และดูแลความเรียบร้อยของคำขอรับบริการทั้งหมด
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">ผู้ใช้งานทั้งหมด</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalUsers} บัญชี</div>
          <p className="text-[11px] text-slate-400 mt-1">Customer & Companion</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">Companion ที่อนุมัติแล้ว</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {verifiedCompanionsCount} / {companions.length} ท่าน
          </div>
          <p className="text-[11px] text-slate-400 mt-1">ผ่านการตรวจประวัติแล้ว</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">คำขอนัดหมายทั้งหมด</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalBookingsCount} รายการ</div>
          <p className="text-[11px] text-slate-400 mt-1">เสร็จสิ้นแล้ว {completedBookingsCount} งาน</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">มูลค่าบริการรวมที่สำเร็จ</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ฿{totalPlatformVolume.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">สร้างรายได้ให้ผู้ร่วมเดินทาง</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'verification'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ตรวจสอบและอนุมัติ Companion</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
            {companions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ติดตามคำขอการเดินทางทั้งหมด</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>รายชื่อผู้ใช้งานในระบบ</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {totalUsers}
          </span>
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                รายชื่อผู้ร่วมเดินทางและสถานะการตรวจสอบเอกสาร (Verification Status)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                แอดมินสามารถคลิกปุ่มเพื่ออนุมัติหรือยกเลิกการรับรองสถานะความปลอดภัยได้ทันที
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {companions.map((companion) => {
                const profile = allProfiles.find((p) => p.id === companion.id) || companion.profile || INITIAL_PROFILES[companion.id];

                return (
                  <div
                    key={companion.id}
                    className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        src={
                          profile?.avatar_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
                        }
                        alt={profile?.full_name || 'Companion'}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                        unoptimized
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{profile?.full_name || 'ผู้ร่วมเดินทาง'}</h4>
                          {companion.is_verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              อนุมัติแล้ว (Verified)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              รอการตรวจสอบ (Pending)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{companion.bio}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>ค่าบริการ: ฿{companion.hourly_rate}/ชม.</span>
                          <span>•</span>
                          <span>ประสบการณ์: {companion.experience_years} ปี</span>
                          <span>•</span>
                          <span>⭐ {companion.rating_avg.toFixed(1)} ({companion.rating_count} รีวิว)</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {profile?.phone || 'ยังไม่ได้ระบุเบอร์โทร'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <button
                        onClick={() => toggleCompanionVerification(companion.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          companion.is_verified
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {companion.is_verified ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>เพิกถอนการอนุมัติ</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>อนุมัติและรับรองประวัติ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: All Bookings Monitoring */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">กรองตามสถานะ:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="กรองตามสถานะ"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value="all">ทั้งหมด ({bookings.length})</option>
                <option value="pending">รอการตอบรับ (pending)</option>
                <option value="accepted">ตอบรับแล้ว (accepted)</option>
                <option value="in_progress">กำลังเดินทาง (in_progress)</option>
                <option value="completed">เสร็จสิ้น (completed)</option>
                <option value="cancelled">ยกเลิก (cancelled)</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อธุระ, จุดรับ, ปลายทาง..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const customer = allProfiles.find((p) => p.id === booking.customer_id) || INITIAL_PROFILES[booking.customer_id];
              const companion = booking.companion_id
                ? allProfiles.find((p) => p.id === booking.companion_id) || INITIAL_PROFILES[booking.companion_id]
                : null;

              return (
                <div
                  key={booking.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{booking.title}</h4>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span>👤 ผู้จอง: {customer?.full_name || 'ลูกค้า'}</span>
                      <span>•</span>
                      <span>
                        🤝 ผู้ช่วย: {companion ? companion.full_name : 'ยังไม่มีผู้รับงาน'}
                      </span>
                      <span>•</span>
                      <span>📅 {booking.scheduled_date} ({booking.duration_hours} ชม.)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      📍 {booking.origin_location} ➔ {booking.destination_location}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className="font-bold text-blue-600 text-sm">
                      ฿{booking.estimated_cost.toLocaleString()}
                    </span>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => setCancelBookingId(booking.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                      >
                        ยกเลิกงาน
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: All User Accounts */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              ผู้ใช้งานทั้งหมดในระบบ Care Companion
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              เชื่อมโยงสิทธิ์การใช้งานผ่าน Supabase PostgreSQL Profile Table
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-bold">ชื่อผู้ใช้งาน</th>
                  <th className="py-3 px-4 font-bold">อีเมล</th>
                  <th className="py-3 px-4 font-bold">เบอร์โทรศัพท์</th>
                  <th className="py-3 px-4 font-bold">บทบาท (Role)</th>
                  <th className="py-3 px-4 font-bold">วันที่สร้างบัญชี</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(allProfiles.length > 0 ? allProfiles : Object.values(INITIAL_PROFILES)).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.full_name || 'ผู้ใช้งาน'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-600">{u.phone || '-'}</td>
                    <td className="py-3 px-4">
                      {u.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700">
                          🛡️ Admin
                        </span>
                      )}
                      {u.role === 'companion' && (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">
                          🤝 Companion
                        </span>
                      )}
                      {u.role === 'customer' && (
                        <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                          👤 Customer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('th-TH') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Cancel Booking Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(cancelBookingId)}
        title="ยืนยันการยกเลิกคำขอในฐานะแอดมิน"
        message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอนี้ในฐานะผู้ดูแลระบบ? สถานะของคำขอจะถูกเปลี่ยนเป็นยกเลิก (cancelled)"
        confirmText="ใช่, ยกเลิกคำขอ"
        cancelText="ย้อนกลับ"
        variant="danger"
        onConfirm={() => {
          if (cancelBookingId) {
            updateBookingStatus(cancelBookingId, 'cancelled');
            setCancelBookingId(null);
          }
        }}
        onCancel={() => setCancelBookingId(null)}
      />
    </div>
  );
}
