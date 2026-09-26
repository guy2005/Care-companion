'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Phone,
  Eye,
  Trash2,
  Clock,
  ShieldAlert,
  CreditCard,
  Car,
  Award,
  Briefcase,
  FileCheck
} from 'lucide-react';
import { formatPhoneNumber, isValidPhoneNumber, isUuid } from '@/lib/formatters';
import { createClient } from '@/lib/supabase/client';

export default function CompanionProfilePage() {
  const router = useRouter();
  const { currentUser, companions, allProfiles, updateCompanionProfile } = useApp();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  const companionId = currentUser?.id || '';
  const companion = companions.find((c) => c.id === companionId) || {
    id: companionId,
    bio: '',
    experience_years: 1,
    skills: ['เข็นรถเข็นผู้สูงอายุ', 'คุ้นเคยระบบโรงพยาบาล'],
    service_areas: ['กรุงเทพฯ'],
    hourly_rate: 250,
    is_verified: true,
    is_available: true,
    rating_avg: 5.0,
    rating_count: 0,
    verification_doc_url: undefined,
    id_card_url: undefined,
    driver_license_url: undefined,
  };
  const userDetails = allProfiles.find((p) => p.id === currentUser?.id) || currentUser;

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

  // 1. National ID Card State
  const idCardInputRef = useRef<HTMLInputElement>(null);
  const [idCardUrl, setIdCardUrl] = useState<string>(companion.id_card_url || companion.verification_doc_url || '');
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [idCardError, setIdCardError] = useState<string | null>(null);
  const [isDraggingIdCard, setIsDraggingIdCard] = useState(false);

  // 2. Driver's License State
  const driverLicenseInputRef = useRef<HTMLInputElement>(null);
  const [driverLicenseUrl, setDriverLicenseUrl] = useState<string>(companion.driver_license_url || '');
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);
  const [driverLicensePreview, setDriverLicensePreview] = useState<string | null>(null);
  const [driverLicenseError, setDriverLicenseError] = useState<string | null>(null);
  const [isDraggingDriverLicense, setIsDraggingDriverLicense] = useState(false);

  // 3. Experience Document 1 State
  const expDoc1InputRef = useRef<HTMLInputElement>(null);
  const [expDoc1Url, setExpDoc1Url] = useState<string>(companion.experience_doc_1_url || '');
  const [expDoc1File, setExpDoc1File] = useState<File | null>(null);
  const [expDoc1Preview, setExpDoc1Preview] = useState<string | null>(null);
  const [expDoc1Error, setExpDoc1Error] = useState<string | null>(null);
  const [isDraggingExpDoc1, setIsDraggingExpDoc1] = useState(false);

  // 4. Experience Document 2 State
  const expDoc2InputRef = useRef<HTMLInputElement>(null);
  const [expDoc2Url, setExpDoc2Url] = useState<string>(companion.experience_doc_2_url || '');
  const [expDoc2File, setExpDoc2File] = useState<File | null>(null);
  const [expDoc2Preview, setExpDoc2Preview] = useState<string | null>(null);
  const [expDoc2Error, setExpDoc2Error] = useState<string | null>(null);
  const [isDraggingExpDoc2, setIsDraggingExpDoc2] = useState(false);

  // Full Preview Modal
  const [previewModalDoc, setPreviewModalDoc] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const active = companions.find((c) => c.id === currentUser.id);
    if (active) {
      setBio(active.bio || '');
      setExperienceYears(active.experience_years ?? 1);
      setHourlyRate(active.hourly_rate ?? 250);
      setSkills(active.skills || []);
      setServiceAreas(active.service_areas || []);
      if (active.id_card_url || active.verification_doc_url) {
        setIdCardUrl(active.id_card_url || active.verification_doc_url || '');
      }
      if (active.driver_license_url) {
        setDriverLicenseUrl(active.driver_license_url);
      }
      if (active.experience_doc_1_url) {
        setExpDoc1Url(active.experience_doc_1_url);
      }
      if (active.experience_doc_2_url) {
        setExpDoc2Url(active.experience_doc_2_url);
      }
    }
    const currentProf = allProfiles.find((p) => p.id === currentUser.id) || currentUser;
    if (currentProf?.phone) {
      setPhone(formatPhoneNumber(currentProf.phone));
    }
  }, [companions, allProfiles, currentUser]);

  // Load preview for existing ID Card
  useEffect(() => {
    if (idCardUrl && !idCardFile) {
      if (idCardUrl.startsWith('http') || idCardUrl.startsWith('blob:') || idCardUrl.startsWith('data:')) {
        setIdCardPreview(idCardUrl);
      } else {
        const supabase = createClient();
        if (supabase) {
          supabase.storage
            .from('verification-docs')
            .createSignedUrl(idCardUrl, 60 * 15)
            .then(({ data }) => {
              if (data?.signedUrl) {
                setIdCardPreview(data.signedUrl);
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [idCardUrl, idCardFile]);

  // Load preview for existing Driver's License
  useEffect(() => {
    if (driverLicenseUrl && !driverLicenseFile) {
      if (driverLicenseUrl.startsWith('http') || driverLicenseUrl.startsWith('blob:') || driverLicenseUrl.startsWith('data:')) {
        setDriverLicensePreview(driverLicenseUrl);
      } else {
        const supabase = createClient();
        if (supabase) {
          supabase.storage
            .from('verification-docs')
            .createSignedUrl(driverLicenseUrl, 60 * 15)
            .then(({ data }) => {
              if (data?.signedUrl) {
                setDriverLicensePreview(data.signedUrl);
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [driverLicenseUrl, driverLicenseFile]);

  // Load preview for existing Experience Doc 1
  useEffect(() => {
    if (expDoc1Url && !expDoc1File) {
      if (expDoc1Url.startsWith('http') || expDoc1Url.startsWith('blob:') || expDoc1Url.startsWith('data:')) {
        setExpDoc1Preview(expDoc1Url);
      } else {
        const supabase = createClient();
        if (supabase) {
          supabase.storage
            .from('verification-docs')
            .createSignedUrl(expDoc1Url, 60 * 15)
            .then(({ data }) => {
              if (data?.signedUrl) {
                setExpDoc1Preview(data.signedUrl);
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [expDoc1Url, expDoc1File]);

  // Load preview for existing Experience Doc 2
  useEffect(() => {
    if (expDoc2Url && !expDoc2File) {
      if (expDoc2Url.startsWith('http') || expDoc2Url.startsWith('blob:') || expDoc2Url.startsWith('data:')) {
        setExpDoc2Preview(expDoc2Url);
      } else {
        const supabase = createClient();
        if (supabase) {
          supabase.storage
            .from('verification-docs')
            .createSignedUrl(expDoc2Url, 60 * 15)
            .then(({ data }) => {
              if (data?.signedUrl) {
                setExpDoc2Preview(data.signedUrl);
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [expDoc2Url, expDoc2File]);

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

  // Helper file validator
  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return 'ขนาดไฟล์ต้องไม่เกิน 5 MB';
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return 'รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) หรือไฟล์ PDF เท่านั้น';
    }
    return null;
  };

  // Process ID Card File
  const processIdCardFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setIdCardError(error);
      return;
    }
    setIdCardError(null);
    setIdCardFile(file);
    if (file.type.startsWith('image/')) {
      setIdCardPreview(URL.createObjectURL(file));
    } else {
      setIdCardPreview('pdf');
    }
  };

  const handleRemoveIdCard = () => {
    setIdCardFile(null);
    setIdCardPreview(null);
    setIdCardUrl('');
    setIdCardError(null);
    if (idCardInputRef.current) {
      idCardInputRef.current.value = '';
    }
  };

  // Process Driver's License File
  const processDriverLicenseFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setDriverLicenseError(error);
      return;
    }
    setDriverLicenseError(null);
    setDriverLicenseFile(file);
    if (file.type.startsWith('image/')) {
      setDriverLicensePreview(URL.createObjectURL(file));
    } else {
      setDriverLicensePreview('pdf');
    }
  };

  const handleRemoveDriverLicense = () => {
    setDriverLicenseFile(null);
    setDriverLicensePreview(null);
    setDriverLicenseUrl('');
    setDriverLicenseError(null);
    if (driverLicenseInputRef.current) {
      driverLicenseInputRef.current.value = '';
    }
  };

  // Process Experience Doc 1 File
  const processExpDoc1File = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setExpDoc1Error(error);
      return;
    }
    setExpDoc1Error(null);
    setExpDoc1File(file);
    if (file.type.startsWith('image/')) {
      setExpDoc1Preview(URL.createObjectURL(file));
    } else {
      setExpDoc1Preview('pdf');
    }
  };

  const handleRemoveExpDoc1 = () => {
    setExpDoc1File(null);
    setExpDoc1Preview(null);
    setExpDoc1Url('');
    setExpDoc1Error(null);
    if (expDoc1InputRef.current) {
      expDoc1InputRef.current.value = '';
    }
  };

  // Process Experience Doc 2 File
  const processExpDoc2File = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setExpDoc2Error(error);
      return;
    }
    setExpDoc2Error(null);
    setExpDoc2File(file);
    if (file.type.startsWith('image/')) {
      setExpDoc2Preview(URL.createObjectURL(file));
    } else {
      setExpDoc2Preview('pdf');
    }
  };

  const handleRemoveExpDoc2 = () => {
    setExpDoc2File(null);
    setExpDoc2Preview(null);
    setExpDoc2Url('');
    setExpDoc2Error(null);
    if (expDoc2InputRef.current) {
      expDoc2InputRef.current.value = '';
    }
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
    setIdCardError(null);
    setDriverLicenseError(null);
    setExpDoc1Error(null);
    setExpDoc2Error(null);

    try {
      const supabase = createClient();
      let finalIdCardUrl = idCardUrl;
      let finalDriverLicenseUrl = driverLicenseUrl;
      let finalExpDoc1Url = expDoc1Url;
      let finalExpDoc2Url = expDoc2Url;

      // 1. Upload ID Card if changed
      if (idCardFile) {
        if (supabase && isUuid(currentUser.id)) {
          const fileExt = idCardFile.name.split('.').pop() || 'jpg';
          const filePath = `${currentUser.id}/id_card_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('verification-docs')
            .upload(filePath, idCardFile, { upsert: true });

          if (uploadError) {
            console.error('ID Card upload error:', uploadError.message);
            setIdCardError(`อัปโหลดบัตรประชาชนไม่สำเร็จ: ${uploadError.message}`);
            setIsSaving(false);
            return;
          }

          finalIdCardUrl = filePath;
          setIdCardUrl(filePath);
        } else {
          finalIdCardUrl = idCardPreview && idCardPreview !== 'pdf'
            ? idCardPreview
            : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
          setIdCardUrl(finalIdCardUrl);
        }
      }

      // 2. Upload Driver's License if changed
      if (driverLicenseFile) {
        if (supabase && isUuid(currentUser.id)) {
          const fileExt = driverLicenseFile.name.split('.').pop() || 'jpg';
          const filePath = `${currentUser.id}/driver_license_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('verification-docs')
            .upload(filePath, driverLicenseFile, { upsert: true });

          if (uploadError) {
            console.error('Driver License upload error:', uploadError.message);
            setDriverLicenseError(`อัปโหลดใบขับขี่ไม่สำเร็จ: ${uploadError.message}`);
            setIsSaving(false);
            return;
          }

          finalDriverLicenseUrl = filePath;
          setDriverLicenseUrl(filePath);
        } else {
          finalDriverLicenseUrl = driverLicensePreview && driverLicensePreview !== 'pdf'
            ? driverLicensePreview
            : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
          setDriverLicenseUrl(finalDriverLicenseUrl);
        }
      }

      // 3. Upload Experience Doc 1 if changed
      if (expDoc1File) {
        if (supabase && isUuid(currentUser.id)) {
          const fileExt = expDoc1File.name.split('.').pop() || 'jpg';
          const filePath = `${currentUser.id}/exp_doc_1_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('verification-docs')
            .upload(filePath, expDoc1File, { upsert: true });

          if (uploadError) {
            console.error('Experience Doc 1 upload error:', uploadError.message);
            setExpDoc1Error(`อัปโหลดเอกสารยืนยันประสบการณ์ 1 ไม่สำเร็จ: ${uploadError.message}`);
            setIsSaving(false);
            return;
          }

          finalExpDoc1Url = filePath;
          setExpDoc1Url(filePath);
        } else {
          finalExpDoc1Url = expDoc1Preview && expDoc1Preview !== 'pdf'
            ? expDoc1Preview
            : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
          setExpDoc1Url(finalExpDoc1Url);
        }
      }

      // 4. Upload Experience Doc 2 if changed
      if (expDoc2File) {
        if (supabase && isUuid(currentUser.id)) {
          const fileExt = expDoc2File.name.split('.').pop() || 'jpg';
          const filePath = `${currentUser.id}/exp_doc_2_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('verification-docs')
            .upload(filePath, expDoc2File, { upsert: true });

          if (uploadError) {
            console.error('Experience Doc 2 upload error:', uploadError.message);
            setExpDoc2Error(`อัปโหลดเอกสารยืนยันประสบการณ์ 2 ไม่สำเร็จ: ${uploadError.message}`);
            setIsSaving(false);
            return;
          }

          finalExpDoc2Url = filePath;
          setExpDoc2Url(filePath);
        } else {
          finalExpDoc2Url = expDoc2Preview && expDoc2Preview !== 'pdf'
            ? expDoc2Preview
            : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
          setExpDoc2Url(finalExpDoc2Url);
        }
      }

      const hasNewDocs = Boolean(idCardFile || driverLicenseFile || expDoc1File || expDoc2File);

      await updateCompanionProfile(
        currentUser.id,
        {
          bio,
          experience_years: experienceYears,
          hourly_rate: hourlyRate,
          skills,
          service_areas: serviceAreas,
          id_card_url: finalIdCardUrl || undefined,
          driver_license_url: finalDriverLicenseUrl || undefined,
          experience_doc_1_url: finalExpDoc1Url || undefined,
          experience_doc_2_url: finalExpDoc2Url || undefined,
          verification_doc_url: finalIdCardUrl || finalDriverLicenseUrl || finalExpDoc1Url || undefined,
          // When a new document is submitted, mark as pending verification for admin inspection
          ...(hasNewDocs ? { is_verified: false } : {}),
        },
        phone.trim()
      );

      setIdCardFile(null);
      setIdCardError(null);
      setDriverLicenseFile(null);
      setDriverLicenseError(null);
      setExpDoc1File(null);
      setExpDoc1Error(null);
      setExpDoc2File(null);
      setExpDoc2Error(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err: any) {
      console.error('Error saving companion profile:', err);
      alert(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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

        {/* Verification Documents Upload & Preview (4 Documents: ID Card, Driver's License, Experience Docs 1 & 2) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                เอกสารยืนยันตัวตนและประสบการณ์ 4 รายการ
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                บัตรประชาชน, ใบขับขี่ และเอกสารรับรองประสบการณ์ 2 รูป เพื่อให้แอดมินตรวจสอบความถูกต้องตามมาตรฐาน PDPA
              </p>
            </div>
            <div>
              {companion.is_verified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  อนุมัติแล้ว (Verified)
                </span>
              ) : (idCardFile || idCardUrl || driverLicenseFile || driverLicenseUrl || expDoc1File || expDoc1Url || expDoc2File || expDoc2Url) ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  รอการตรวจสอบโดยแอดมิน
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                  ยังไม่ได้แนบเอกสาร
                </span>
              )}
            </div>
          </div>

          {/* Privacy & Safety Callout */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-800">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              การคุ้มครองข้อมูลส่วนบุคคล (PDPA Notice):
            </div>
            <p className="text-slate-600 leading-relaxed">
              เอกสารทุกรายการจะถูกจัดเก็บใน Private Storage Bucket เข้าถึงได้เฉพาะผู้ดูแลระบบเท่านั้น (ลูกค้าภายนอกจะไม่เห็นเอกสารนี้) • 
              <strong> คำแนะนำ:</strong> ท่านสามารถขีดฆ่า <em>&quot;ใช้เพื่อยืนยันตัวตน Care Companion เท่านั้น&quot;</em> หรือปิดทับข้อมูลศาสนาและกรุ๊ปเลือดได้
            </p>
          </div>

          {/* 4-Column Responsive Grid for Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. National ID Card Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    1. ภาพถ่ายบัตรประชาชน (จำเป็น)
                  </span>
                  {(idCardFile || idCardUrl) ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      แนบแล้ว
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      จำเป็น
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  ใช้ตรวจสอบชื่อ-นามสกุล และความปลอดภัยก่อนรับงาน
                </p>

                {idCardPreview ? (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                        {idCardPreview === 'pdf' ? (
                          <FileText className="w-7 h-7 text-rose-500" />
                        ) : (
                          <img
                            src={idCardPreview}
                            alt="บัตรประชาชน"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {idCardFile ? idCardFile.name : 'บัตรประชาชนในระบบ'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {idCardFile ? `${(idCardFile.size / 1024).toFixed(1)} KB (ไฟล์ใหม่)` : 'บันทึกในระบบแล้ว'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {idCardPreview !== 'pdf' && (
                        <button
                          type="button"
                          onClick={() => setPreviewModalDoc({ title: 'ภาพถ่ายบัตรประชาชน', url: idCardPreview })}
                          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูรูปขยาย
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveIdCard}
                        className="py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        เปลี่ยน
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingIdCard(true);
                    }}
                    onDragLeave={() => setIsDraggingIdCard(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingIdCard(false);
                      if (e.dataTransfer.files?.[0]) {
                        processIdCardFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => idCardInputRef.current?.click()}
                    className={`p-5 rounded-xl border-2 border-dashed transition text-center cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                      isDraggingIdCard
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-white bg-slate-50/60'
                    }`}
                  >
                    <input
                      ref={idCardInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && processIdCardFile(e.target.files[0])}
                    />
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      คลิกเลือก หรือลากรูปบัตรประชาชนมาที่นี่
                    </p>
                    <p className="text-[10px] text-slate-400">
                      รองรับ JPG, PNG, PDF (ไม่เกิน 5MB)
                    </p>
                  </div>
                )}

                {idCardError && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {idCardError}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Driver's License Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" />
                    2. ภาพถ่ายใบขับขี่ (สำหรับผู้ที่ขับรถ)
                  </span>
                  {(driverLicenseFile || driverLicenseUrl) ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      แนบแล้ว
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                      ตัวเลือก
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  ใช้รับรองกรณีให้บริการเดินทางด้วยรถยนต์ส่วนตัว
                </p>

                {driverLicensePreview ? (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                        {driverLicensePreview === 'pdf' ? (
                          <FileText className="w-7 h-7 text-rose-500" />
                        ) : (
                          <img
                            src={driverLicensePreview}
                            alt="ใบขับขี่"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {driverLicenseFile ? driverLicenseFile.name : 'ใบขับขี่ในระบบ'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {driverLicenseFile ? `${(driverLicenseFile.size / 1024).toFixed(1)} KB (ไฟล์ใหม่)` : 'บันทึกในระบบแล้ว'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {driverLicensePreview !== 'pdf' && (
                        <button
                          type="button"
                          onClick={() => setPreviewModalDoc({ title: 'ภาพถ่ายใบอนุญาตขับขี่', url: driverLicensePreview })}
                          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูรูปขยาย
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveDriverLicense}
                        className="py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        เปลี่ยน
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingDriverLicense(true);
                    }}
                    onDragLeave={() => setIsDraggingDriverLicense(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingDriverLicense(false);
                      if (e.dataTransfer.files?.[0]) {
                        processDriverLicenseFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => driverLicenseInputRef.current?.click()}
                    className={`p-5 rounded-xl border-2 border-dashed transition text-center cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                      isDraggingDriverLicense
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-300 hover:border-blue-500 hover:bg-white bg-slate-50/60'
                    }`}
                  >
                    <input
                      ref={driverLicenseInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && processDriverLicenseFile(e.target.files[0])}
                    />
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      คลิกเลือก หรือลากรูปใบขับขี่มาที่นี่
                    </p>
                    <p className="text-[10px] text-slate-400">
                      รองรับ JPG, PNG, PDF (ไม่เกิน 5MB)
                    </p>
                  </div>
                )}

                {driverLicenseError && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {driverLicenseError}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Experience Doc 1 Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    3. เอกสารรับรองประสบการณ์ 1 (แนะนำ)
                  </span>
                  {(expDoc1File || expDoc1Url) ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      แนบแล้ว
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                      ตัวเลือก
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  วุฒิบัตรปฐมพยาบาล, ประกาศนียบัตร หรือภาพขณะปฏิบัติงานจริง
                </p>

                {expDoc1Preview ? (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                        {expDoc1Preview === 'pdf' ? (
                          <FileText className="w-7 h-7 text-rose-500" />
                        ) : (
                          <img
                            src={expDoc1Preview}
                            alt="เอกสารประสบการณ์ 1"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {expDoc1File ? expDoc1File.name : 'เอกสารประสบการณ์ 1 ในระบบ'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {expDoc1File ? `${(expDoc1File.size / 1024).toFixed(1)} KB (ไฟล์ใหม่)` : 'บันทึกในระบบแล้ว'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {expDoc1Preview !== 'pdf' && (
                        <button
                          type="button"
                          onClick={() => setPreviewModalDoc({ title: 'เอกสารยืนยันประสบการณ์ รูปที่ 1', url: expDoc1Preview })}
                          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูรูปขยาย
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveExpDoc1}
                        className="py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        เปลี่ยน
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingExpDoc1(true);
                    }}
                    onDragLeave={() => setIsDraggingExpDoc1(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingExpDoc1(false);
                      if (e.dataTransfer.files?.[0]) {
                        processExpDoc1File(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => expDoc1InputRef.current?.click()}
                    className={`p-5 rounded-xl border-2 border-dashed transition text-center cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                      isDraggingExpDoc1
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-300 hover:border-amber-500 hover:bg-white bg-slate-50/60'
                    }`}
                  >
                    <input
                      ref={expDoc1InputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && processExpDoc1File(e.target.files[0])}
                    />
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      คลิกเลือก หรือลากรูปเอกสารประสบการณ์ 1
                    </p>
                    <p className="text-[10px] text-slate-400">
                      รองรับ JPG, PNG, PDF (ไม่เกิน 5MB)
                    </p>
                  </div>
                )}

                {expDoc1Error && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {expDoc1Error}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Experience Doc 2 Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    4. เอกสารรับรองประสบการณ์ 2 (เพิ่มเติม)
                  </span>
                  {(expDoc2File || expDoc2Url) ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      แนบแล้ว
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                      ตัวเลือก
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  หนังสือรับรองการทำงาน, ใบประกอบวิชาชีพ หรือเอกสารอบรม
                </p>

                {expDoc2Preview ? (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-14 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                        {expDoc2Preview === 'pdf' ? (
                          <FileText className="w-7 h-7 text-rose-500" />
                        ) : (
                          <img
                            src={expDoc2Preview}
                            alt="เอกสารประสบการณ์ 2"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {expDoc2File ? expDoc2File.name : 'เอกสารประสบการณ์ 2 ในระบบ'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {expDoc2File ? `${(expDoc2File.size / 1024).toFixed(1)} KB (ไฟล์ใหม่)` : 'บันทึกในระบบแล้ว'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {expDoc2Preview !== 'pdf' && (
                        <button
                          type="button"
                          onClick={() => setPreviewModalDoc({ title: 'เอกสารยืนยันประสบการณ์ รูปที่ 2', url: expDoc2Preview })}
                          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูรูปขยาย
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveExpDoc2}
                        className="py-1.5 px-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        เปลี่ยน
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingExpDoc2(true);
                    }}
                    onDragLeave={() => setIsDraggingExpDoc2(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingExpDoc2(false);
                      if (e.dataTransfer.files?.[0]) {
                        processExpDoc2File(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => expDoc2InputRef.current?.click()}
                    className={`p-5 rounded-xl border-2 border-dashed transition text-center cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                      isDraggingExpDoc2
                        ? 'border-purple-500 bg-purple-50/50'
                        : 'border-slate-300 hover:border-purple-500 hover:bg-white bg-slate-50/60'
                    }`}
                  >
                    <input
                      ref={expDoc2InputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && processExpDoc2File(e.target.files[0])}
                    />
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      คลิกเลือก หรือลากรูปเอกสารประสบการณ์ 2
                    </p>
                    <p className="text-[10px] text-slate-400">
                      รองรับ JPG, PNG, PDF (ไม่เกิน 5MB)
                    </p>
                  </div>
                )}

                {expDoc2Error && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {expDoc2Error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลบริการ'}</span>
          </button>
        </div>
      </form>

      {/* Full Document Preview Modal */}
      {previewModalDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {previewModalDoc.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModalDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-100 bg-slate-900/5 flex items-center justify-center p-2">
              <img
                src={previewModalDoc.url}
                alt={previewModalDoc.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-xs"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewModalDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
