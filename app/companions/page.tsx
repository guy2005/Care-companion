'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import CompanionCard from '@/components/CompanionCard';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  SlidersHorizontal, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

function CompanionsList() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialArea = searchParams.get('area') || '';

  const { companions, categories } = useApp();

  const [keyword, setKeyword] = useState('');
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxRate, setMaxRate] = useState<number>(500);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'experience'>('rating');

  // Filter logic
  const filteredCompanions = useMemo(() => {
    return companions
      .filter((c) => {
        // Keyword filter
        if (keyword.trim()) {
          const kw = keyword.toLowerCase();
          const matchBio = c.bio.toLowerCase().includes(kw);
          const matchSkills = c.skills.some((s) => s.toLowerCase().includes(kw));
          if (!matchBio && !matchSkills) return false;
        }

        // Area filter
        if (selectedArea.trim()) {
          const areaKw = selectedArea.toLowerCase();
          const matchArea = c.service_areas.some((a) => a.toLowerCase().includes(areaKw));
          if (!matchArea) return false;
        }

        // Hourly rate filter
        if (c.hourly_rate > maxRate) {
          return false;
        }

        // Verified only
        if (verifiedOnly && !c.is_verified) {
          return false;
        }

        // Available only
        if (availableOnly && !c.is_available) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating_avg - a.rating_avg;
        } else if (sortBy === 'price_asc') {
          return a.hourly_rate - b.hourly_rate;
        } else {
          return b.experience_years - a.experience_years;
        }
      });
  }, [companions, keyword, selectedArea, maxRate, verifiedOnly, availableOnly, sortBy]);

  const resetFilters = () => {
    setKeyword('');
    setSelectedArea('');
    setSelectedCategory('');
    setMaxRate(500);
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-10 shadow-lg shadow-blue-500/10">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4" />
            ผู้ช่วยร่วมเดินทางมืออาชีพ
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            ค้นหาและเลือกผู้ช่วยร่วมเดินทาง (Companion)
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            เลือกดูข้อมูลประวัติ ประสบการณ์ ทักษะเฉพาะทาง ค่าบริการ และพื้นที่ที่พร้อมให้บริการ เพื่อความอุ่นใจในการเดินทางไปทำธุระของคุณ
          </p>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filter + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <aside className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              ตัวกรองการค้นหา
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ล้างค่า
            </button>
          </div>

          {/* Keyword Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">คำค้นหา / ทักษะ</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="เช่น รถเข็น, มีรถยนต์..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Service Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">พื้นที่ / เขต</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="เช่น พญาไท, จตุจักร, บางนา..."
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Max Hourly Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>ค่าบริการสูงสุด</span>
              <span className="text-blue-600 font-extrabold">฿{maxRate} / ชม.</span>
            </div>
            <input
              type="range"
              min={150}
              max={500}
              step={20}
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>฿150</span>
              <span>฿500</span>
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 rounded-sm"
              />
              <span className="font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                เฉพาะที่ผ่านการตรวจประวัติ (Verified)
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 rounded-sm"
              />
              <span className="font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                เฉพาะที่พร้อมรับงานทันที
              </span>
            </label>
          </div>
        </aside>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600">
              พบผู้ร่วมเดินทางทั้งหมด{' '}
              <span className="font-bold text-slate-900">{filteredCompanions.length}</span> ท่าน
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">เรียงตาม:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="เรียงตาม"
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">คะแนนรีวิวสูงสุด ⭐</option>
                <option value="price_asc">ค่าบริการเริ่มต้นต่ำสุด ฿</option>
                <option value="experience">ประสบการณ์มากที่สุด ⏳</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredCompanions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCompanions.map((companion) => (
                <CompanionCard key={companion.id} companion={companion} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">ไม่พบผู้ร่วมเดินทางที่ตรงกับเงื่อนไข</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ลองปรับลดเงื่อนไขตัวกรอง หรือค้นหาด้วยชื่อเขตใกล้เคียงอื่น
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ตตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompanionsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">กำลังโหลดข้อมูลผู้ร่วมเดินทาง...</div>}>
      <CompanionsList />
    </Suspense>
  );
}
