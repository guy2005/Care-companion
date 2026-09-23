'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Upload,
  AlertCircle,
  LogIn,
  Phone
} from 'lucide-react';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/formatters';

export default function CompanionProfilePage() {
  const router = useRouter();
  const { currentUser, companions, allProfiles, updateCompanionProfile } = useApp();

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
          <p className="text-xs text-slate-500">กรุณาเข้าสู่ระบบก่อนเพื่อจัดการข้อมูลบริการ</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
            <LogIn className="w-4 h-4" />
            ไปยังหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  const companionId = currentUser.id;
  const companion = companions.find((c) => c.id === companionId) || {
    id: currentUser.id,
    bio: '',
    experience_years: 1,
    skills: ['เข็นรถเข็นผู้สูงอายุ', 'คุ้นเคยระบบโรงพยาบาล'],
    service_areas: ['กรุงเทพฯ'],
    hourly_rate: 250,
    is_verified: true,
    is_available: true,
    rating_avg: 5.0,
    rating_count: 0,
  };
  const userDetails = allProfiles.find((p) => p.id === currentUser.id) || currentUser;

  const [phone, setPhone] = useState(userDetails?.phone ? formatPhoneNumber(userDetails.phone) : '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [bio, setBio] = useState(companion.bio || '');
  const [experienceYears, setExperienceYears] = useState(companion.experience_years || 1);
  const [hourlyRate, setHourlyRate] = useState(companion.hourly_rate || 250);
  const [skills, setSkills] = useState<string[]>(companion.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>(companion.service_areas || []);
  const [newArea, setNewArea] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const active = companions.find((c) => c.id === currentUser.id);
    if (active) {
      setBio(active.bio || '');
      setExperienceYears(active.experience_years ?? 1);
      setHourlyRate(active.hourly_rate ?? 250);
      setSkills(active.skills || []);
      setServiceAreas(active.service_areas || []);
    }
    const currentProf = allProfiles.find((p) => p.id === currentUser.id) || currentUser;
    if (currentProf?.phone) {
      setPhone(formatPhoneNumber(currentProf.phone));
    }
  }, [companions, allProfiles, currentUser]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, phone);
    setPhone(formatted);
    if (phoneError) {
      setPhoneError(null);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newArea.trim() && !serviceAreas.includes(newArea.trim())) {
      setServiceAreas([...serviceAreas, newArea.trim()]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (areaToRemove: string) => {
    setServiceAreas(serviceAreas.filter((a) => a !== areaToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation: must be 10 digits and 2 dashes (12 characters total, e.g. 086-555-1234)
    if (!isValidPhoneNumber(phone)) {
      setPhoneError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก และมีเครื่องหมายขีด (-) รวม 12 ตัวอักษร เช่น 086-555-1234');
      return;
    }

    setPhoneError(null);
    setIsSaving(true);
    try {
      await updateCompanionProfile(
        currentUser.id,
        {
          bio,
          experience_years: experienceYears,
          hourly_rate: hourlyRate,
          skills,
          service_areas: serviceAreas,
        },
        phone.trim()
      );
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving companion profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/companion/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังแดชบอร์ดผู้ร่วมเดินทาง</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          แก้ไขข้อมูลการให้บริการ (Companion Profile)
        </h1>
        <p className="text-xs text-slate-500">
          ข้อมูลนี้จะแสดงให้ลูกค้า (Customer) เห็นเมื่อทำการค้นหาหรือเลือกจองผู้ช่วย
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Name & Phone Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">ชื่อผู้ให้บริการ</p>
              <p className="text-sm font-bold text-slate-800">{userDetails?.full_name}</p>
            </div>
            {companion.is_verified && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                ยืนยันตัวตนแล้ว
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>เบอร์โทรศัพท์สำหรับติดต่อ (บันทึกลงระบบ Supabase)</span>
                <span className="text-rose-500">*</span>
              </span>
              <span className={`text-[10px] font-bold ${phone.length === 12 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {phone.length}/12 ตัว
              </span>
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="086-555-1234"
                maxLength={12}
                value={phone}
                onChange={handlePhoneChange}
                required
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 font-mono tracking-wider transition ${
                  phoneError
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {phoneError ? (
              <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{phoneError}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                * พิมพ์เฉพาะตัวเลข ระบบจะใส่ขีด (-) ให้อัตโนมัติ (เช่น 086 ➔ ขีด ➔ 555 ➔ ขีด ➔ 1234 รวม 12 ตัวอักษร)
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">คำแนะนำตัวและประสบการณ์</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Experience & Hourly Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ประสบการณ์ (ปี)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ค่าบริการต่อชั่วโมง (บาท/ชม.)</label>
            <input
              type="number"
              min={100}
              max={1000}
              step={10}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Skills Management */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">ทักษะและความสามารถเฉพาะทาง</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-emerald-500 hover:text-rose-500 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="เพิ่มทักษะใหม่ เช่น ช่วยพยุงเดิน, ขับรถยนต์, ภาษาจีนเบื้องต้น"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่ม
            </button>
          </div>
        </div>

        {/* Service Areas Management */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">พื้นที่ที่สะดวกให้บริการ</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
              >
                <span>{area}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArea(area)}
                  className="text-blue-500 hover:text-rose-500 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="เพิ่มเขต/พื้นที่ เช่น กรุงเทพฯ - สาทร, นนทบุรี - เมือง"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddArea}
              className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่ม
            </button>
          </div>
        </div>

        {/* Verification Document Info */}
        <div className="pt-4 border-t border-slate-100 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              เอกสารยืนยันตัวตน (บัตรประชาชน / ใบขับขี่)
            </span>
            {companion.is_verified ? (
              <span className="text-[11px] font-bold text-emerald-600">อนุมัติแล้ว</span>
            ) : (
              <span className="text-[11px] font-bold text-amber-600">รอการตรวจสอบโดยแอดมิน</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            เอกสารจะถูกจัดเก็บใน Supabase Storage Bucket `verification-docs` อย่างปลอดภัยและเข้าถึงได้เฉพาะแอดมินเท่านั้น
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลบริการ'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
