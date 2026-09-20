'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { HeartHandshake, User, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, loginAsDemo } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDemo(selectedRole);
    if (selectedRole === 'customer') {
      router.push('/customer/dashboard');
    } else if (selectedRole === 'companion') {
      router.push('/companion/profile');
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center text-white">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">ยินดีต้อนรับสู่ Care Companion</h1>
          <p className="text-xs text-slate-500">
            โปรดเลือกบทบาทการใช้งานของคุณเพื่อเริ่มต้นสร้างโปรไฟล์
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedRole('customer')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                selectedRole === 'customer'
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">ลูกค้า (Customer)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  สำหรับผู้ที่ต้องการหาผู้ช่วยร่วมเดินทาง เช่น ผู้สูงอายุ หรือผู้ทำธุระนอกบ้าน
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
                <span>เลือกบทบาทนี้</span>
                {selectedRole === 'customer' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
            </div>

            <div
              onClick={() => setSelectedRole('companion')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                selectedRole === 'companion'
                  ? 'border-emerald-600 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">ผู้ร่วมเดินทาง (Companion)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  สำหรับผู้ที่ต้องการให้บริการร่วมเดินทางและดูแลความสะดวกในการทำธุระ
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <span>เลือกบทบาทนี้</span>
                {selectedRole === 'companion' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ชื่อ-นามสกุล ที่แสดงในระบบ</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น นายสมชาย ใจดี"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition shadow-md shadow-blue-600/20"
          >
            <span>ดำเนินการต่อ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
