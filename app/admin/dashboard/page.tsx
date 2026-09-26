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
  Phone,
  Eye,
  FileText,
  ExternalLink,
  X,
  CreditCard,
  Car,
  Award,
  FileCheck
} from 'lucide-react';
import { BookingStatus, CompanionProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

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

  // Document Inspection Modal State (4 documents: ID Card, Driver License, Experience Docs 1 & 2)
  const [inspectingCompanion, setInspectingCompanion] = useState<CompanionProfile | null>(null);
  const [inspectingIdCardUrl, setInspectingIdCardUrl] = useState<string | null>(null);
  const [inspectingDriverLicenseUrl, setInspectingDriverLicenseUrl] = useState<string | null>(null);
  const [inspectingExpDoc1Url, setInspectingExpDoc1Url] = useState<string | null>(null);
  const [inspectingExpDoc2Url, setInspectingExpDoc2Url] = useState<string | null>(null);
  const [loadingDocUrl, setLoadingDocUrl] = useState<boolean>(false);

  const handleInspectDocument = async (comp: CompanionProfile) => {
    setInspectingCompanion(comp);
    setInspectingIdCardUrl(null);
    setInspectingDriverLicenseUrl(null);
    setInspectingExpDoc1Url(null);
    setInspectingExpDoc2Url(null);

    const idCardSource = comp.id_card_url || comp.verification_doc_url;
    const driverLicenseSource = comp.driver_license_url;
    const expDoc1Source = comp.experience_doc_1_url;
    const expDoc2Source = comp.experience_doc_2_url;

    if (!idCardSource && !driverLicenseSource && !expDoc1Source && !expDoc2Source) return;

    setLoadingDocUrl(true);
    try {
      const supabase = createClient();

      // 1. Resolve ID Card URL
      if (idCardSource) {
        if (
          idCardSource.startsWith('http') ||
          idCardSource.startsWith('blob:') ||
          idCardSource.startsWith('data:')
        ) {
          setInspectingIdCardUrl(idCardSource);
        } else if (supabase) {
          const { data } = await supabase.storage
            .from('verification-docs')
            .createSignedUrl(idCardSource, 60 * 15);
          if (data?.signedUrl) setInspectingIdCardUrl(data.signedUrl);
        }
      }

      // 2. Resolve Driver's License URL
      if (driverLicenseSource) {
        if (
          driverLicenseSource.startsWith('http') ||
          driverLicenseSource.startsWith('blob:') ||
          driverLicenseSource.startsWith('data:')
        ) {
          setInspectingDriverLicenseUrl(driverLicenseSource);
        } else if (supabase) {
          const { data } = await supabase.storage
            .from('verification-docs')
            .createSignedUrl(driverLicenseSource, 60 * 15);
          if (data?.signedUrl) setInspectingDriverLicenseUrl(data.signedUrl);
        }
      }

      // 3. Resolve Experience Doc 1 URL
      if (expDoc1Source) {
        if (
          expDoc1Source.startsWith('http') ||
          expDoc1Source.startsWith('blob:') ||
          expDoc1Source.startsWith('data:')
        ) {
          setInspectingExpDoc1Url(expDoc1Source);
        } else if (supabase) {
          const { data } = await supabase.storage
            .from('verification-docs')
            .createSignedUrl(expDoc1Source, 60 * 15);
          if (data?.signedUrl) setInspectingExpDoc1Url(data.signedUrl);
        }
      }

      // 4. Resolve Experience Doc 2 URL
      if (expDoc2Source) {
        if (
          expDoc2Source.startsWith('http') ||
          expDoc2Source.startsWith('blob:') ||
          expDoc2Source.startsWith('data:')
        ) {
          setInspectingExpDoc2Url(expDoc2Source);
        } else if (supabase) {
          const { data } = await supabase.storage
            .from('verification-docs')
            .createSignedUrl(expDoc2Source, 60 * 15);
          if (data?.signedUrl) setInspectingExpDoc2Url(data.signedUrl);
        }
      }
    } catch (e) {
      console.error('Failed to get signed URLs', e);
    } finally {
      setLoadingDocUrl(false);
    }
  };

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
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4" />
            แผงควบคุมระบบส่วนกลาง (Admin Console)
          </span>
          <h1 className="text-xl sm:text-3xl font-black mt-2">
            ภาพรวมและบริหารจัดการ Care Companion
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            ตรวจสอบความปลอดภัย อนุมัติผู้ร่วมเดินทาง และดูแลความเรียบร้อยของคำขอรับบริการทั้งหมด
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold">ผู้ใช้งานทั้งหมด</span>
            <Users className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">{totalUsers} บัญชี</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">Customer & Companion</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold">Companion อนุมัติแล้ว</span>
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 sm:mt-2">
            {verifiedCompanionsCount} / {companions.length} ท่าน
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">ผ่านการตรวจประวัติแล้ว</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold">คำขอนัดหมาย</span>
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">{totalBookingsCount} รายการ</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">เสร็จสิ้นแล้ว {completedBookingsCount} งาน</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold">มูลค่ารวมที่สำเร็จ</span>
            <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2">
            ฿{totalPlatformVolume.toLocaleString()}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">สร้างรายได้ให้ผู้ช่วย</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-2 px-2.5 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'verification'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ตรวจสอบ Companion</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs bg-purple-100 text-purple-700">
            {companions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-2 px-2.5 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'bookings'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>ติดตามคำขอทั้งหมด</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs bg-slate-100 text-slate-700">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-2.5 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>รายชื่อผู้ใช้งาน</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs bg-slate-100 text-slate-700">
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

                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                      {(() => {
                        const hasId = Boolean(companion.id_card_url || companion.verification_doc_url);
                        const hasDriver = Boolean(companion.driver_license_url);
                        const hasExp1 = Boolean(companion.experience_doc_1_url);
                        const hasExp2 = Boolean(companion.experience_doc_2_url);
                        const docCount = (hasId ? 1 : 0) + (hasDriver ? 1 : 0) + (hasExp1 ? 1 : 0) + (hasExp2 ? 1 : 0);

                        return docCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleInspectDocument(companion)}
                            className="px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span>ดูเอกสาร ({docCount} ฉบับ)</span>
                          </button>
                        ) : (
                          <span className="px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>ยังไม่แนบเอกสาร</span>
                          </span>
                        );
                      })()}

                      <button
                        onClick={() => toggleCompanionVerification(companion.id)}
                        className={`w-full sm:w-auto min-h-[44px] justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-[0.98] cursor-pointer ${
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
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 shrink-0">สถานะ:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="กรองตามสถานะ"
                className="w-full sm:w-auto min-h-[42px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white"
              >
                <option value="all">ทั้งหมด ({bookings.length})</option>
                <option value="pending">รอการตอบรับ (pending)</option>
                <option value="accepted">ตอบรับแล้ว (accepted)</option>
                <option value="in_progress">กำลังเดินทาง (in_progress)</option>
                <option value="completed">เสร็จสิ้น (completed)</option>
                <option value="cancelled">ยกเลิก (cancelled)</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="ค้นหาชื่อธุระ, จุดรับ, ปลายทาง..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white"
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
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1.5 w-full">
                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{booking.title}</h4>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>👤 ผู้จอง: {customer?.full_name || 'ลูกค้า'}</span>
                      {booking.passenger_name && booking.passenger_name !== customer?.full_name && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            ผู้รับบริการ: {booking.passenger_name} {booking.passenger_age ? `(อายุ ${booking.passenger_age} ปี)` : ''}
                          </span>
                        </>
                      )}
                      <span className="hidden sm:inline">•</span>
                      <span>
                        🤝 ผู้ช่วย: {companion ? companion.full_name : 'ยังไม่มีผู้รับงาน'}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>📅 {booking.scheduled_date} ({booking.duration_hours} ชม.)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      📍 {booking.origin_location} ➔ {booking.destination_location}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="font-bold text-blue-600 text-sm">
                      ฿{booking.estimated_cost.toLocaleString()}
                    </span>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => setCancelBookingId(booking.id)}
                        className="px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer active:scale-[0.98]"
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

      {/* Document Inspection Modal for Admin */}
      {inspectingCompanion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  ตรวจสอบเอกสารยืนยันตัวตนและประสบการณ์ (4 รายการ)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {allProfiles.find((p) => p.id === inspectingCompanion.id)?.full_name || 'ผู้ร่วมเดินทาง'} (รหัส: #{inspectingCompanion.id.slice(-6).toUpperCase()})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingCompanion(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDocUrl ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center space-y-2 text-slate-500">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">กำลังดึงลิงก์เอกสารที่ปลอดภัย (Signed URL)...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {/* 1. ID Card Card */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>1. ภาพถ่ายบัตรประชาชน</span>
                      </div>
                      {inspectingIdCardUrl ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          แนบแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                          ยังไม่แนบ
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white min-h-[200px] max-h-[260px] flex items-center justify-center overflow-hidden p-2">
                      {inspectingIdCardUrl ? (
                        <img
                          src={inspectingIdCardUrl}
                          alt="บัตรประจำตัวประชาชน"
                          className="max-h-[240px] w-auto object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-8 text-slate-400 space-y-1">
                          <CreditCard className="w-10 h-10 mx-auto stroke-1" />
                          <p className="text-xs font-semibold text-slate-500">ยังไม่ได้อัปโหลดบัตรประชาชน</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {inspectingIdCardUrl && (
                    <a
                      href={inspectingIdCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-[11px] font-bold inline-flex items-center justify-center gap-1 py-1 hover:underline cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      เปิดดูบัตรประชาชนขนาดเต็ม
                    </a>
                  )}
                </div>

                {/* 2. Driver License Card */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Car className="w-4 h-4 text-blue-600" />
                        <span>2. ภาพถ่ายใบขับขี่</span>
                      </div>
                      {inspectingDriverLicenseUrl ? (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          แนบแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                          ยังไม่แนบ
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white min-h-[200px] max-h-[260px] flex items-center justify-center overflow-hidden p-2">
                      {inspectingDriverLicenseUrl ? (
                        <img
                          src={inspectingDriverLicenseUrl}
                          alt="ใบอนุญาตขับรถ"
                          className="max-h-[240px] w-auto object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-8 text-slate-400 space-y-1">
                          <Car className="w-10 h-10 mx-auto stroke-1" />
                          <p className="text-xs font-semibold text-slate-500">ยังไม่ได้อัปโหลดใบขับขี่</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {inspectingDriverLicenseUrl && (
                    <a
                      href={inspectingDriverLicenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-[11px] font-bold inline-flex items-center justify-center gap-1 py-1 hover:underline cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      เปิดดูใบขับขี่ขนาดเต็ม
                    </a>
                  )}
                </div>

                {/* 3. Experience Doc 1 Card */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>3. เอกสารรับรองประสบการณ์ 1</span>
                      </div>
                      {inspectingExpDoc1Url ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          แนบแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                          ยังไม่แนบ
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white min-h-[200px] max-h-[260px] flex items-center justify-center overflow-hidden p-2">
                      {inspectingExpDoc1Url ? (
                        <img
                          src={inspectingExpDoc1Url}
                          alt="เอกสารรับรองประสบการณ์ 1"
                          className="max-h-[240px] w-auto object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-8 text-slate-400 space-y-1">
                          <Award className="w-10 h-10 mx-auto stroke-1" />
                          <p className="text-xs font-semibold text-slate-500">ยังไม่ได้อัปโหลดเอกสารประสบการณ์ 1</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {inspectingExpDoc1Url && (
                    <a
                      href={inspectingExpDoc1Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:text-amber-800 text-[11px] font-bold inline-flex items-center justify-center gap-1 py-1 hover:underline cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      เปิดดูเอกสารประสบการณ์ 1 ขนาดเต็ม
                    </a>
                  )}
                </div>

                {/* 4. Experience Doc 2 Card */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <FileCheck className="w-4 h-4 text-purple-600" />
                        <span>4. เอกสารรับรองประสบการณ์ 2</span>
                      </div>
                      {inspectingExpDoc2Url ? (
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                          แนบแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                          ยังไม่แนบ
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white min-h-[200px] max-h-[260px] flex items-center justify-center overflow-hidden p-2">
                      {inspectingExpDoc2Url ? (
                        <img
                          src={inspectingExpDoc2Url}
                          alt="เอกสารรับรองประสบการณ์ 2"
                          className="max-h-[240px] w-auto object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-8 text-slate-400 space-y-1">
                          <FileCheck className="w-10 h-10 mx-auto stroke-1" />
                          <p className="text-xs font-semibold text-slate-500">ยังไม่ได้อัปโหลดเอกสารประสบการณ์ 2</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {inspectingExpDoc2Url && (
                    <a
                      href={inspectingExpDoc2Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:text-purple-800 text-[11px] font-bold inline-flex items-center justify-center gap-1 py-1 hover:underline cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      เปิดดูเอกสารประสบการณ์ 2 ขนาดเต็ม
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
              <span>🔒 ความปลอดภัย: ลิงก์รูปภาพชั่วคราวจะหมดอายุภายใน 15 นาทีตามมาตรฐาน PDPA</span>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectingCompanion(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleCompanionVerification(inspectingCompanion.id);
                    setInspectingCompanion(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    inspectingCompanion.is_verified
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  {inspectingCompanion.is_verified ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>เพิกถอนการอนุมัติ</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>อนุมัติและรับรองประวัติ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
