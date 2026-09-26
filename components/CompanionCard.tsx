import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CompanionProfile } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { Star, ShieldCheck, MapPin, Clock, ArrowRight, CheckCircle, Phone, Ban } from 'lucide-react';

interface CompanionCardProps {
  companion: CompanionProfile;
}

export default function CompanionCard({ companion }: CompanionCardProps) {
  const { currentUser, role, allProfiles } = useApp();
  const isSelf = Boolean(currentUser && currentUser.id === companion.id);
  const isCompanionOrAdmin = currentUser && (role === 'companion' || role === 'admin');
  const profile = companion.profile || allProfiles.find((p) => p.id === companion.id) || INITIAL_PROFILES[companion.id];
  const name = profile?.full_name || 'ผู้ร่วมเดินทาง';
  const avatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Header with Photo and Basic Stats */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <Image
                src={avatar}
                alt={name}
                width={72}
                height={72}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:scale-105 transition"
                unoptimized
              />
              {companion.is_verified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-xs"
                  title="ผ่านการตรวจสอบประวัติโดยแอดมินแล้ว"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 truncate">{name}</h3>
                {isSelf && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    👤 บัญชีของคุณ
                  </span>
                )}
                {companion.is_available ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    พร้อมรับงาน
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    ไม่ว่างขณะนี้
                  </span>
                )}
              </div>

              {/* Rating and Experience */}
              <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-xs text-slate-600 flex-wrap">
                <div className="flex items-center gap-1 font-semibold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{companion.rating_avg.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({companion.rating_count})</span>
                </div>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>ประสบการณ์ {companion.experience_years} ปี</span>
                </div>
              </div>

              {/* Hourly Rate & Phone */}
              <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                <div className="text-sm font-bold text-blue-600">
                  ฿{companion.hourly_rate}{' '}
                  <span className="text-xs font-normal text-slate-500">/ ชั่วโมง</span>
                </div>
                {profile?.phone && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{profile.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio snippet */}
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {companion.bio || 'พร้อมให้บริการดูแลและเดินทางไปเป็นเพื่อนอย่างปลอดภัยและสุภาพ'}
          </p>
        </div>

        {/* Skills & Areas */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 border-t border-b border-slate-100 space-y-2">
          {/* Skills tags */}
          <div className="flex flex-wrap gap-1.5">
            {companion.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs"
              >
                <CheckCircle className="w-3 h-3 text-blue-500" />
                {skill}
              </span>
            ))}
            {companion.skills.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                +{companion.skills.length - 3}
              </span>
            )}
          </div>

          {/* Service Areas */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{companion.service_areas.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 sm:p-4 bg-white">
        {isCompanionOrAdmin ? (
          <Link
            href={`/companions/${companion.id}`}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition border border-slate-200/80 group-hover:border-slate-300"
          >
            <span>{isSelf ? 'ดูประวัติของคุณ' : 'ดูประวัติ'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-slate-500" />
          </Link>
        ) : isSelf ? (
          <div className="flex gap-2">
            <Link
              href={`/companions/${companion.id}`}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <span>ดูโปรไฟล์</span>
            </Link>
            <button
              disabled
              type="button"
              title="คุณไม่สามารถจ้างตัวเองเป็นผู้ร่วมเดินทางได้"
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed"
            >
              <Ban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>ไม่สามารถจ้างตัวเอง</span>
            </button>
          </div>
        ) : (
          <Link
            href={`/companions/${companion.id}`}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition shadow-xs group-hover:bg-blue-700"
          >
            <span>ดูประวัติและจองผู้ช่วยนี้</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
