'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { HeartHandshake, ShieldCheck, Sparkles, ArrowRight, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '@/lib/types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMode = (searchParams.get('mode') as UserRole) || 'customer';
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loginAsDemo } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultMode);
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMessage('กรุณาระบุชื่อ-นามสกุล');
          setIsLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password, fullName, selectedRole);
        if (res.success) {
          setSuccessMessage('สร้างบัญชีสำเร็จแล้ว! กำลังนำคุณเข้าสู่ระบบ...');
          setTimeout(() => {
            if (selectedRole === 'customer') router.push('/customer/dashboard');
            else if (selectedRole === 'companion') router.push('/companion/profile');
            else router.push('/admin/dashboard');
          }, 1000);
        } else {
          setErrorMessage(res.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res.success) {
          setSuccessMessage('เข้าสู่ระบบสำเร็จ! กำลังนำคุณเข้าสู่ระบบ...');
          setTimeout(() => {
            if (selectedRole === 'customer') router.push('/customer/dashboard');
            else if (selectedRole === 'companion') router.push('/companion/dashboard');
            else router.push('/admin/dashboard');
          }, 1000);
        } else {
          setErrorMessage(res.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemo(role);
    if (role === 'customer') router.push('/customer/dashboard');
    else if (role === 'companion') router.push('/companion/dashboard');
    else if (role === 'admin') router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 to-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-blue-500/5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">เข้าสู่ระบบ Care Companion</h2>
          <p className="text-xs text-slate-500">
            ระบบเชื่อมต่อด้วย Supabase Authentication และ Google Account
          </p>
        </div>

        {/* Role Selector for First-Time / Intent */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            เลือกบทบาทการใช้งานของคุณ:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                selectedRole === 'customer'
                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              👤 ลูกค้า
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('companion')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                selectedRole === 'companion'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🤝 ผู้ช่วย
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                selectedRole === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-400 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🛡️ แอดมิน
            </button>
          </div>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-center border-b-2 transition ${
              authMethod === 'google'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Google Account
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-center border-b-2 transition ${
              authMethod === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Email / Password (Supabase)
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {authMethod === 'google' ? (
          /* Google OAuth Login Button */
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.19 0 10.04 0 12s.45 3.81 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google Account'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-400">
              * ต้องเปิดใช้งาน Google Provider ในหน้า Supabase Dashboard ก่อนใช้งาน
            </p>
          </div>
        ) : (
          /* Email / Password Form */
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                อีเมล (Email)
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition shadow-sm text-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading
                ? 'กำลังดำเนินการ...'
                : isSignUp
                ? `สมัครสมาชิกในฐานะ ${selectedRole.toUpperCase()}`
                : 'เข้าสู่ระบบ'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(''); }}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                {isSignUp ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิกใหม่'}
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>เข้าสู่ระบบด่วนเพื่อทดสอบและตรวจงาน (One-Click Demo):</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 text-left transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  สช
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">คุณสมชาย ใจดี (ลูกค้า / Customer)</p>
                  <p className="text-[10px] text-blue-600">ค้นหาผู้ช่วย, จองการเดินทาง, ติดตามสถานะ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('companion')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 text-left transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  ปย
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">คุณปรียา รักดูแล (ผู้ช่วย / Companion)</p>
                  <p className="text-[10px] text-emerald-600">รับงาน, อัปเดตสถานะการเดินทาง, แก้ไขประวัติ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/80 text-left transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  AD
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-900">แอดมินระบบกลาง (Admin)</p>
                  <p className="text-[10px] text-purple-600">ตรวจสถิติรวม, อนุมัติผู้ร่วมเดินทาง, ดูแลทุกคำขอ</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            ข้อมูลบัญชีและการทำรายการทั้งหมดได้รับการควบคุมด้วยนโยบายความปลอดภัย Row Level Security (RLS) บน Supabase PostgreSQL
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">กำลังโหลด...</div>}>
      <LoginForm />
    </Suspense>
  );
}
