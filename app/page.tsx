'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import CompanionCard from '@/components/CompanionCard';
import { 
  HeartHandshake, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Star, 
  ArrowRight, 
  MapPin, 
  Stethoscope, 
  Building2, 
  ShoppingBag, 
  Compass, 
  CheckCircle2, 
  Users,
  Smile
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { companions, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const featuredCompanions = companions.slice(0, 3);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedArea) params.set('area', selectedArea);
    router.push(`/companions?${params.toString()}`);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 text-blue-600" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-emerald-600" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6 text-amber-600" />;
      default:
        return <Compass className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
              <span>ผู้ช่วยร่วมเดินทางที่ตรวจสอบประวัติแล้ว ปลอดภัย อุ่นใจทุกเส้นทาง</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              ไปทำธุระได้อย่างมั่นใจ <br />
              มี <span className="text-blue-600 underline decoration-blue-300 decoration-wavy">Care Companion</span> ร่วมเดินทางเคียงข้าง
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              แพลตฟอร์มจัดหาผู้ช่วยร่วมเดินทางสำหรับผู้สูงอายุและผู้ที่ต้องการความสะดวก 
              ช่วยพาไปพบแพทย์ตามนัด ติดต่อธนาคาร หน่วยงานราชการ หรือซื้อของนอกบ้าน
            </p>
          </div>

          {/* Quick Search Card */}
          <div className="mt-8 max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-xl shadow-blue-500/5 border border-slate-200/80">
            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  ประเภทของธุระ
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="เลือกประเภทของธุระ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ทุกประเภทธุระ</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  พื้นที่ให้บริการ / เขต
                </label>
                <input
                  type="text"
                  placeholder="เช่น พญาไท, บางนา, จตุจักร..."
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition shadow-md shadow-blue-600/20"
                >
                  <Search className="w-4 h-4" />
                  <span>ค้นหาผู้ร่วมเดินทาง</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                มีผู้ช่วยพร้อมบริการกว่า 50+ พื้นที่
              </span>
              <Link
                href="/bookings/new"
                className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                หรือสร้างคำขอนัดหมายแบบกำหนดเอง <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Value Props Row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">ยืนยันตัวตนแล้ว</p>
                <p className="text-[11px] text-slate-500">ผ่านการตรวจบัตร ปชช.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">ตรงต่อเวลา</p>
                <p className="text-[11px] text-slate-500">นัดหมายล่วงหน้าได้</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">รีวิวตามจริง</p>
                <p className="text-[11px] text-slate-500">จากลูกค้าที่ใช้บริการ</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">สุภาพ เอาใจใส่</p>
                <p className="text-[11px] text-slate-500">เข้าใจความต้องการ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            บริการร่วมเดินทางที่ตอบโจทย์ทุกธุระของคุณ
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            เลือกประเภทธุระที่คุณต้องการความช่วยเหลือ เรามีผู้ช่วยที่เชี่ยวชาญพร้อมร่วมเดินทาง
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  {getCategoryIcon(category.icon)}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{category.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{category.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={`/companions?category=${encodeURIComponent(category.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>หาผู้ช่วยประเภทนี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Companions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
              <span>ผู้ร่วมเดินทางยอดนิยม</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ผู้ช่วยที่ได้รับคะแนนรีวิวสูง
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              เลือกดูประวัติ ทักษะ และพื้นที่บริการของผู้ช่วยที่คุณไว้วางใจได้
            </p>
          </div>
          <Link
            href="/companions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
          >
            <span>ดูผู้ช่วยทั้งหมด ({companions.length} ท่าน)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCompanions.map((companion) => (
            <CompanionCard key={companion.id} companion={companion} />
          ))}
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              ขั้นตอนการใช้งานง่ายๆ เพียง 4 ขั้นตอน
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              เชื่อมโยงคุณกับผู้ช่วยร่วมเดินทางได้อย่างสะดวกรวดเร็วและปลอดภัย
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">ระบุความต้องการ</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                กำหนดประเภทธุระ วัน เวลา สถานที่ต้นทาง จุดหมาย และรายละเอียดพิเศษที่ต้องการ
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">ค้นหาหรือรอการตอบรับ</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                เลือก Companion ที่ตรงใจ หรือสร้างคำขอเพื่อรอผู้ช่วยในพื้นที่กดรับงาน
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-2">ร่วมเดินทางและทำธุระ</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ผู้ช่วยเดินทางมาพบตามนัด คอยอำนวยความสะดวกจนกระทั่งเสร็จสิ้นภารกิจ
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-white mb-2">สิ้นสุดและให้คะแนน</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ยืนยันการสิ้นสุดการให้บริการ ให้คะแนนดาวและรีวิวเพื่อสร้างมาตรฐานความปลอดภัย
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box for Both Roles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">สำหรับผู้ต้องการผู้ช่วย</span>
              <h3 className="text-2xl font-bold">ต้องการผู้ช่วยร่วมเดินทางในวันพรุ่งนี้?</h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                สร้างคำขอนัดหมายล่วงหน้า ระบุเวลาและสถานที่เพื่อรับการดูแลอย่างดีที่สุด
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/bookings/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-blue-900 bg-white hover:bg-blue-50 transition shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>จองบริการทันที</span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">สำหรับผู้สนใจให้บริการ</span>
              <h3 className="text-2xl font-bold">อยากเป็นส่วนหนึ่งของ Care Companion?</h3>
              <p className="text-sm text-emerald-100 leading-relaxed">
                มีเวลาว่าง ใจรักการบริการ อยากช่วยเหลือผู้สูงอายุและสร้างรายได้เสริมในพื้นที่ของคุณ
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/login?mode=companion"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-emerald-950 bg-white hover:bg-emerald-50 transition shadow-sm"
              >
                <Users className="w-4 h-4" />
                <span>สมัครเป็นผู้ร่วมเดินทาง</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
