'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { MobilityLevel } from '@/lib/types';
import { formatPhoneNumber } from '@/lib/formatters';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Compass, 
  UserCheck, 
  ArrowRight,
  AlertCircle,
  Phone,
  Ban,
  User,
  Users,
  HeartPulse,
  ShieldAlert,
  Activity
} from 'lucide-react';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCompanionId = searchParams.get('companion_id') || '';

  const { currentUser, role, companions, categories, allProfiles, createBooking, loginAsDemo } = useApp();

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
  
  // Passenger & Care Details
  const [isForOther, setIsForOther] = useState(false);
  const [passengerName, setPassengerName] = useState(currentUser?.full_name || '');
  const [passengerAge, setPassengerAge] = useState<string>(currentUser?.age ? String(currentUser.age) : '65');
  const [passengerGender, setPassengerGender] = useState<'female' | 'male' | 'other'>('female');
  const [mobilityLevel, setMobilityLevel] = useState<MobilityLevel>('independent');
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser?.emergency_contact_name || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser?.emergency_contact_phone ? formatPhoneNumber(currentUser.emergency_contact_phone) : '');
  const [medicalNotes, setMedicalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync with current user profile if available
  useEffect(() => {
    if (currentUser && !isForOther) {
      if (!passengerName) setPassengerName(currentUser.full_name || '');
      if (currentUser.age) setPassengerAge(String(currentUser.age));
      if (currentUser.gender) setPassengerGender(currentUser.gender as any);
      if (currentUser.emergency_contact_name) setEmergencyContactName(currentUser.emergency_contact_name);
      if (currentUser.emergency_contact_phone) setEmergencyContactPhone(formatPhoneNumber(currentUser.emergency_contact_phone));
    }
  }, [currentUser, isForOther]);

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

  const isSelfSelected = Boolean(currentUser && selectedCompanionId && selectedCompanionId === currentUser.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSelfSelected) {
      setError('คุณไม่สามารถจ้างตัวเองเป็นผู้ร่วมเดินทางได้ กรุณาเลือกผู้ช่วยท่านอื่น หรือเปิดรับคำขอทั่วไป');
      return;
    }

    if (!title.trim() || !origin.trim() || !destination.trim() || !scheduledDate || !scheduledTime) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (หัวข้อธุระ, จุดรับต้นทาง, ปลายทาง, วันที่ และเวลา)');
      return;
    }

    if (isForOther && !passengerName.trim()) {
      setError('กรุณาระบุชื่อ-นามสกุลของผู้รับบริการเดินทาง');
      return;
    }

    // Use active logged-in user id, or fallback to demo customer
    let customerId = currentUser?.id;
    if (!customerId) {
      loginAsDemo('customer');
      customerId = '55555555-5555-5555-5555-555555555555';
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
        is_for_other: isForOther,
        passenger_name: isForOther ? passengerName.trim() : (currentUser?.full_name || passengerName.trim() || 'ผู้เดินทาง'),
        passenger_age: passengerAge ? parseInt(String(passengerAge), 10) : undefined,
        passenger_gender: passengerGender,
        mobility_level: mobilityLevel,
        emergency_contact_name: emergencyContactName.trim() || undefined,
        emergency_contact_phone: emergencyContactPhone.trim() || undefined,
        medical_notes: medicalNotes.trim() || undefined,
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
      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm space-y-6 sm:space-y-8">
        {/* Section 1: Errand Details */}
        <div className="space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
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
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full min-h-[80px] p-3.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section 2: Passenger & Care Requirements */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              2. ข้อมูลผู้ร่วมเดินทาง & สุขภาพ/ฉุกเฉิน
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              * ข้อมูลนี้ใช้เพื่อความปลอดภัยในการดูแลเท่านั้น
            </span>
          </div>

          {/* Toggle: Self vs Other */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              ใครเป็นผู้รับบริการเดินทางในทริปนี้?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsForOther(false);
                  if (currentUser) {
                    setPassengerName(currentUser.full_name);
                    if (currentUser.age) setPassengerAge(String(currentUser.age));
                    if (currentUser.emergency_contact_name) setEmergencyContactName(currentUser.emergency_contact_name);
                    if (currentUser.emergency_contact_phone) setEmergencyContactPhone(formatPhoneNumber(currentUser.emergency_contact_phone));
                  }
                }}
                className={`min-h-[46px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                  !isForOther
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>ฉันเดินทางเอง</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForOther(true);
                  if (passengerName === currentUser?.full_name) {
                    setPassengerName('');
                  }
                }}
                className={`min-h-[46px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                  isForOther
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>จองให้ผู้อื่น (พ่อ, แม่, ญาติ)</span>
              </button>
            </div>
          </div>

          {/* Passenger Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-slate-700">
                {isForOther ? 'ชื่อ-นามสกุล ผู้เดินทาง' : 'ชื่อผู้รับบริการ'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={isForOther ? "เช่น คุณแม่สมศรี ใจดี" : "ชื่อของคุณ"}
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                required
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                อายุ (ปี) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={120}
                placeholder="เช่น 74"
                value={passengerAge}
                onChange={(e) => setPassengerAge(e.target.value)}
                required
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">เพศของผู้เดินทาง</label>
              <select
                value={passengerGender}
                onChange={(e) => setPassengerGender(e.target.value as any)}
                aria-label="เลือกเพศของผู้เดินทาง"
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="female">หญิง</option>
                <option value="male">ชาย</option>
                <option value="other">อื่นๆ / ไม่ระบุ</option>
              </select>
            </div>
          </div>

          {/* Mobility Level Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>ระดับการเคลื่อนไหว / สภาพร่างกาย</span>
              <span className="text-[11px] text-blue-600 font-semibold">เพื่อให้ผู้ช่วยเตรียมพร้อม</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'independent', label: 'เดินคล่องปกติ', icon: '🚶', desc: 'ไม่ต้องใช้อุปกรณ์' },
                { id: 'needs_cane', label: 'เดินช้า / ไม้เท้า', icon: '🦯', desc: 'ต้องการช่วยพยุง' },
                { id: 'wheelchair', label: 'นั่งวีลแชร์', icon: '♿', desc: 'ต้องช่วยเข็นรถ' },
                { id: 'bedridden', label: 'ดูแลใกล้ชิด', icon: '🛏️', desc: 'ความช่วยเหลือพิเศษ' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setMobilityLevel(item.id as MobilityLevel)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    mobilityLevel === item.id
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div className="text-xs font-bold text-slate-900">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Contact & Medical Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>ชื่อผู้ติดต่อฉุกเฉิน (Emergency Contact)</span>
              </label>
              <input
                type="text"
                placeholder="เช่น คุณสมชาย (บุตร), คุณพัชรี (ญาติ)"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>เบอร์โทรติดต่อฉุกเฉิน</span>
              </label>
              <input
                type="tel"
                placeholder="081-234-5678"
                maxLength={12}
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(formatPhoneNumber(e.target.value, emergencyContactPhone))}
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>ข้อมูลสุขภาพเบื้องต้น / โรคประจำตัว / ยาที่ต้องพกติดตัว (Medical Notes)</span>
            </label>
            <input
              type="text"
              placeholder="เช่น โรคเบาหวาน/ความดัน, ทานยาเรียบร้อยแล้ว, แพ้ยาเพนิซิลลิน, หูตึงเล็กน้อย"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section 3: Locations */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            3. สถานที่ต้นทางและจุดหมายปลายทาง
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
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Date & Duration */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            4. วัน เวลา และระยะเวลาที่ต้องการใช้บริการ
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
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Section 5: Choose Companion or Open Request */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            5. เลือกผู้ร่วมเดินทาง (Companion)
          </h2>

          <div className="space-y-2">
            <select
              value={selectedCompanionId}
              onChange={(e) => setSelectedCompanionId(e.target.value)}
              aria-label="เลือกผู้ร่วมเดินทาง"
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                📢 เปิดรับคำขอทั่วไป (ให้ผู้ช่วยในพื้นที่กดรับงานตามสะดวก)
              </option>
              {companions
                .filter((c) => c.is_verified)
                .map((c) => {
                  const p = allProfiles.find((prof) => prof.id === c.id) || INITIAL_PROFILES[c.id] || c.profile;
                  const isSelf = Boolean(currentUser && c.id === currentUser.id);
                  return (
                    <option key={c.id} value={c.id} disabled={isSelf}>
                      👤 {p?.full_name || 'ผู้ช่วย'} - ฿{c.hourly_rate}/ชม. (⭐ {c.rating_avg.toFixed(1)})
                      {isSelf ? ' 🚫 (บัญชีของคุณ - ไม่สามารถจ้างตัวเองได้)' : ''}
                    </option>
                  );
                })}
            </select>
            {isSelfSelected ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs flex items-center gap-2 text-rose-800 mt-2">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">
                  คุณไม่สามารถจ้างตัวเองเป็นผู้ร่วมเดินทางได้ กรุณาเลือกผู้ช่วยท่านอื่น หรือเลือกเปิดรับคำขอทั่วไป
                </span>
              </div>
            ) : selectedCompanion && (() => {
              const p = allProfiles.find((prof) => prof.id === selectedCompanion.id) || INITIAL_PROFILES[selectedCompanion.id] || selectedCompanion.profile;
              return (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800">ผู้ช่วยที่เลือก: {p?.full_name}</span>
                    {p?.phone && (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>โทร: {p.phone}</span>
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-emerald-700">฿{selectedCompanion.hourly_rate} / ชม.</span>
                </div>
              );
            })()}
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
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="p-4 sm:p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-center sm:text-left">
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
            disabled={isSubmitting || isSelfSelected}
            className={`w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-white transition shadow-lg text-sm sm:text-base ${
              isSelfSelected
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-600/25 cursor-pointer disabled:opacity-50'
            }`}
          >
            {isSelfSelected ? (
              <>
                <Ban className="w-4 h-4" />
                <span>ไม่สามารถจ้างตัวเองได้ (กรุณาเปลี่ยนผู้ช่วย)</span>
              </>
            ) : isSubmitting ? (
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
