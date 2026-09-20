'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar, 
  ShieldAlert, 
  Award,
  Heart,
  MessageSquare
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompanionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { companions, reviews } = useApp();

  const companion = companions.find((c) => c.id === resolvedParams.id);
  const profile = companion?.profile || INITIAL_PROFILES[resolvedParams.id];
  const companionReviews = reviews.filter((r) => r.companion_id === resolvedParams.id);

  if (!companion || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">ไม่พบข้อมูลผู้ร่วมเดินทางนี้</h2>
        <Link
          href="/companions"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปยังหน้ารายการ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/companions"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปค้นหาผู้ร่วมเดินทาง</span>
        </Link>
      </div>

      {/* Main Grid: Profile Info + Booking Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Details & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <Image
                  src={
                    profile.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
                  }
                  alt={profile.full_name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-50 shadow-md"
                  unoptimized
                />
                {companion.is_verified && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white p-1.5 rounded-full shadow-sm"
                    title="ผ่านการตรวจบัตรประชาชนและประวัติอาชญากรรมเบื้องต้นแล้ว"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">{profile.full_name}</h1>
                  {companion.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      ตรวจสอบประวัติแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      รอการตรวจสอบ
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{companion.rating_avg.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({companion.rating_count} รีวิว)</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>ประสบการณ์ {companion.experience_years} ปี</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>ผู้ร่วมเดินทางมาตรฐาน</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About / Bio */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900">เกี่ยวกับผู้ร่วมเดินทาง</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {companion.bio || 'ยินดีร่วมเดินทางและช่วยเหลือการทำธุระนอกบ้านอย่างสุภาพและปลอดภัย'}
              </p>
            </div>

            {/* Skills & Capabilities */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900">ทักษะและความสามารถในการดูแล</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {companion.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                พื้นที่ที่สะดวกให้บริการ
              </h2>
              <div className="flex flex-wrap gap-2">
                {companion.service_areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Reviews Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">รีวิวและความเห็นจากลูกค้า</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {companionReviews.length} รีวิว
              </span>
            </div>

            {companionReviews.length > 0 ? (
              <div className="space-y-4">
                {companionReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {review.customer?.full_name?.charAt(0) || 'ล'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {review.customer?.full_name || 'ลูกค้า Care Companion'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(review.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                ยังไม่มีรีวิวสำหรับผู้ช่วยท่านนี้ จะปรากฏเมื่อมีลูกค้าใช้บริการและเสร็จสิ้นรายการ
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Booking Action Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border-2 border-blue-600/20 shadow-xl shadow-blue-500/5 space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">อัตราค่าบริการ</span>
              <div className="text-3xl font-black text-blue-600 mt-1">
                ฿{companion.hourly_rate}
                <span className="text-sm font-normal text-slate-500"> / ชั่วโมง</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                * ค่าบริการคิดตามชั่วโมงจริงที่ร่วมเดินทาง
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>สถานะรับงาน:</span>
                {companion.is_available ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    พร้อมรับงานทันที
                  </span>
                ) : (
                  <span className="font-bold text-slate-400">ไม่ว่างชั่วคราว</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>คะแนนความพึงพอใจ:</span>
                <span className="font-bold text-slate-800">⭐ {companion.rating_avg.toFixed(1)} / 5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>การตอบกลับ:</span>
                <span className="font-bold text-slate-800">รวดเร็วภายใน 15 นาที</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/bookings/new?companion_id=${companion.id}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-600/25"
              >
                <Calendar className="w-4 h-4" />
                <span>จองผู้ช่วยท่านนี้</span>
              </Link>
            </div>

            {/* Platform Reassurance */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>ตรวจสอบข้อมูลยืนยันตัวตนของผู้ช่วยผ่านระบบส่วนกลาง</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>ไม่ใช่การรักษาทางการแพทย์ ทำหน้าที่อำนวยความสะดวกในการเดินทางเท่านั้น</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
