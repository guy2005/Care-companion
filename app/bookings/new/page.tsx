'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Compass, 
  UserCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCompanionId = searchParams.get('companion_id') || '';

  const { currentUser, role, companions, categories, createBooking, loginAsDemo } = useApp();

  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [durationHours, setDurationHours] = useState(2.5);
  const [selectedCompanionId, setSelectedCompanionId] = useState(initialCompanionId);
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    setScheduledDate(dateString);
  }, []);

  // Calculate estimated cost
  const selectedCompanion = companions.find((c) => c.id === selectedCompanionId);
  const ratePerHour = selectedCompanion ? selectedCompanion.hourly_rate : 250;
  const estimatedCost = Math.round(durationHours * ratePerHour);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !origin.trim() || !destination.trim() || !scheduledDate || !scheduledTime) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    // Auto-login as customer if currently logged in as companion/admin or not logged in
    let customerId = currentUser?.id;
    if (!currentUser || role !== 'customer') {
      loginAsDemo('customer');
      customerId = 'user-customer-1';
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        customer_id: customerId!,
        companion_id: selectedCompanionId || null,
        service_category_id: categoryId || null,
        title,
        description,
        origin_location: origin,
        destination_location: destination,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration_hours: durationHours,
        estimated_cost: estimatedCost,
        special_notes: specialNotes,
      });

      router.push('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างคำขอ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          สร้างคำขอบริการใหม่
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ระบุรายละเอียดความต้องการเดินทาง
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          กรอกรายละเอียดสถานที่ วันเวลา และธุระของคุณ เพื่อให้ผู้ช่วยร่วมเดินทางเตรียมพร้อมอำนวยความสะดวกได้อย่างตรงใจ
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
        {/* Section 1: Errand Details */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            1. ข้อมูลธุระที่ต้องการร่วมเดินทาง
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                ประเภทธุระ <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="เลือกประเภทธุระ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                หัวข้อธุระสั้นๆ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น พาคุณยายไปพบแพทย์คลินิกตา, ติดต่อทำบัตร ปชช."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">รายละเอียดเพิ่มเติมของธุระ</label>
            <textarea
              rows={2}
              placeholder="ระบุสิ่งที่ต้องการให้ช่วยเหลือ เช่น ช่วยรอคิวรับยา, ช่วยถือเอกสาร หรือแจ้งแผนกที่ต้องไป"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section 2: Locations */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            2. สถานที่ต้นทางและจุดหมายปลายทาง
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                สถานที่ต้นทาง (จุดนัดพบ/บ้าน) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น คอนโดเดอะเบส พหลโยธิน, ซอยสุขุมวิท 39"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                สถานที่ปลายทาง (จุดทำธุระ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น โรงพยาบาลรามาธิบดี, ธนาคารกรุงเทพ สาขาสยาม"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Date & Duration */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            3. วัน เวลา และระยะเวลาที่ต้องการใช้บริการ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                วันนัดหมาย <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                เวลานัดพบ <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                ระยะเวลาโดยประมาณ (ชั่วโมง) <span className="text-rose-500">*</span>
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                aria-label="เลือกระยะเวลาโดยประมาณ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1.5}>1.5 ชั่วโมง</option>
                <option value={2.0}>2.0 ชั่วโมง</option>
                <option value={2.5}>2.5 ชั่วโมง</option>
                <option value={3.0}>3.0 ชั่วโมง</option>
                <option value={4.0}>4.0 ชั่วโมง (ครึ่งวัน)</option>
                <option value={6.0}>6.0 ชั่วโมง</option>
                <option value={8.0}>8.0 ชั่วโมง (เต็มวัน)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Choose Companion or Open Request */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            4. เลือกผู้ร่วมเดินทาง (Companion)
          </h2>

          <div className="space-y-2">
            <select
              value={selectedCompanionId}
              onChange={(e) => setSelectedCompanionId(e.target.value)}
              aria-label="เลือกผู้ร่วมเดินทาง"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                📢 เปิดรับคำขอทั่วไป (ให้ผู้ช่วยในพื้นที่กดรับงานตามสะดวก)
              </option>
              {companions.map((c) => {
                const p = INITIAL_PROFILES[c.id];
                return (
                  <option key={c.id} value={c.id}>
                    👤 {p?.full_name || 'ผู้ช่วย'} - ฿{c.hourly_rate}/ชม. (⭐ {c.rating_avg.toFixed(1)})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-400">
              * หากไม่ระบุผู้ช่วย คำขอจะถูกส่งไปยังกระดานงานของผู้ร่วมเดินทางทุกคนในพื้นที่เพื่อกดรับงาน
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ความต้องการพิเศษ / ข้อมูลสุขภาพเบื้องต้น
            </label>
            <input
              type="text"
              placeholder="เช่น มีรถเข็นส่วนตัว, เดินช้า, มีสัมภาระ 2 ชิ้น หรือต้องการผู้ช่วยที่พูดภาษาอังกฤษได้"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-700">ประมาณการค่าบริการ</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-900">
              ฿{estimatedCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-blue-600 mt-0.5">
              คำนวณจาก {durationHours} ชั่วโมง × ฿{ratePerHour}/ชม.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-600/25 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>กำลังส่งคำขอ...</span>
            ) : (
              <>
                <span>ยืนยันและส่งคำขอร่วมเดินทาง</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">กำลังโหลดแบบฟอร์ม...</div>}>
      <BookingForm />
    </Suspense>
  );
}
