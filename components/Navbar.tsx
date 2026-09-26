'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { 
  HeartHandshake, 
  User, 
  ShieldCheck, 
  Calendar, 
  Search, 
  LogOut, 
  LogIn, 
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Home,
  Briefcase,
  FileText
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, switchRole, signOut } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleSwitch = async (newRole: UserRole) => {
    await switchRole(newRole);
    if (newRole === 'customer') {
      router.push('/customer/dashboard');
    } else if (newRole === 'companion') {
      router.push('/companion/dashboard');
    } else if (newRole === 'admin') {
      router.push('/admin/dashboard');
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'customer':
        return { label: 'ลูกค้า (Customer)', badge: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'companion':
        return { label: 'ผู้ร่วมทาง (Companion)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'admin':
        return { label: 'ผู้ดูแลระบบ (Admin)', badge: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
  };

  const currentRoleInfo = getRoleLabel(role);

  // Accurate Route matching
  const isHomeActive = pathname === '/';
  const isCompanionsActive = pathname.startsWith('/companions');
  const isBookingNewActive = pathname === '/bookings/new';
  const isCustomerDashActive = pathname.startsWith('/customer');
  const isCompanionDashActive = pathname === '/companion/dashboard';
  const isCompanionProfileActive = pathname === '/companion/profile';
  const isAdminDashActive = pathname.startsWith('/admin');

  // Mobile navigation link renderer with glowing active spot
  const renderMobileNavLink = (
    href: string,
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    colorTheme: 'blue' | 'emerald' | 'purple' = 'blue'
  ) => {
    const glowClasses = {
      blue: 'bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 text-blue-800 border-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.22)] ring-1 ring-blue-400/40',
      emerald: 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 text-emerald-800 border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.22)] ring-1 ring-emerald-400/40',
      purple: 'bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 text-purple-800 border-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.22)] ring-1 ring-purple-400/40',
    };

    const dotClasses = {
      blue: 'bg-blue-600 shadow-[0_0_10px_#2563eb,0_0_20px_#3b82f6]',
      emerald: 'bg-emerald-600 shadow-[0_0_10px_#059669,0_0_20px_#10b981]',
      purple: 'bg-purple-600 shadow-[0_0_10px_#9333ea,0_0_20px_#a855f7]',
    };

    const badgeClasses = {
      blue: 'bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]',
      emerald: 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(5,150,105,0.4)]',
      purple: 'bg-purple-600 text-white shadow-[0_0_8px_rgba(147,51,234,0.4)]',
    };

    const iconClasses = {
      blue: isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500',
      emerald: isActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500',
      purple: isActive ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500',
    };

    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border min-h-[50px] ${
          isActive
            ? glowClasses[colorTheme]
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition ${iconClasses[colorTheme]}`}>
            {icon}
          </div>
          <span className="font-semibold text-slate-900">{label}</span>
        </div>

        {isActive ? (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotClasses[colorTheme]}`}></span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClasses[colorTheme]}`}>
              กำลังดูอยู่นี่
            </span>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-slate-200 opacity-60" />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Demo Helper Bar for Evaluation & Easy Presentation */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">
              {currentUser?.email
                ? `บัญชี: ${currentUser.email} (${currentRoleInfo.label.split(' ')[0]}) - สลับบทบาทตรวจงาน:`
                : 'โหมดทดสอบระบบสำหรับตรวจงาน & การนำเสนอ (สลับบทบาทได้ทันที):'}
            </span>
            <span className="sm:hidden font-semibold truncate max-w-[130px]">
              สลับบทบาทตรวจงาน:
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <button
              onClick={() => handleRoleSwitch('customer')}
              className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition shrink-0 cursor-pointer ${
                role === 'customer'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              👤 Customer
            </button>
            <button
              onClick={() => handleRoleSwitch('companion')}
              className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition shrink-0 cursor-pointer ${
                role === 'companion'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              🤝 Companion
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition shrink-0 cursor-pointer ${
                role === 'admin'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Care Companion
                </span>
                <span className="block text-[10px] font-medium text-slate-700 tracking-wider">
                  ผู้ช่วยร่วมเดินทางและทำธุระ
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isHomeActive
                  ? 'text-blue-600 bg-blue-50/90 font-semibold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              หน้าแรก
            </Link>
            <Link
              href="/companions"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isCompanionsActive
                  ? 'text-blue-600 bg-blue-50/90 font-semibold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              ค้นหาผู้ร่วมเดินทาง
            </Link>
            {(!currentUser || role === 'customer') && (
              <Link
                href="/bookings/new"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isBookingNewActive
                    ? 'text-blue-600 bg-blue-50/90 font-semibold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                ขอรับบริการเดินทาง
              </Link>
            )}

            {/* Role-Specific Dashboard Links */}
            {role === 'customer' && (
              <Link
                href="/customer/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isCustomerDashActive
                    ? 'text-blue-600 bg-blue-50/90 font-semibold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                การจองของฉัน
              </Link>
            )}

            {role === 'companion' && (
              <>
                <Link
                  href="/companion/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isCompanionDashActive
                      ? 'text-emerald-600 bg-emerald-50/90 font-semibold shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  งานที่ได้รับมอบหมาย
                </Link>
                <Link
                  href="/companion/profile"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    isCompanionProfileActive
                      ? 'text-emerald-600 bg-emerald-50/90 font-semibold shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  ข้อมูลบริการ
                </Link>
              </>
            )}

            {role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isAdminDashActive
                    ? 'text-purple-600 bg-purple-50/90 font-semibold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                แผงควบคุมผู้ดูแลระบบ
              </Link>
            )}
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  >
                    {currentUser.avatar_url ? (
                      <Image
                        src={currentUser.avatar_url}
                        alt={currentUser.full_name}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white"
                        unoptimized
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {currentUser.full_name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left text-xs">
                      <div className="font-semibold text-slate-800 leading-tight">
                        {currentUser.full_name}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded-sm text-[10px] font-semibold border ${currentRoleInfo.badge}`}
                      >
                        {role.toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">เข้าสู่ระบบด้วยอีเมล</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      {role === 'customer' && (
                        <Link
                          href="/customer/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                        >
                          แดชบอร์ดลูกค้า
                        </Link>
                      )}
                      {role === 'companion' && (
                        <Link
                          href="/companion/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                        >
                          แดชบอร์ดผู้ร่วมเดินทาง
                        </Link>
                      )}
                      {role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 font-medium"
                        >
                          แดชบอร์ดผู้ดูแลระบบ
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            signOut();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ Google
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Touch friendly min 44x44px */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 bg-slate-100/80 hover:bg-slate-200 active:scale-95 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Modern Visual Polish & Glowing Current Location Effect */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* User Profile Card inside Mobile Drawer */}
          {currentUser ? (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {currentUser.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUser.full_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {currentUser.full_name}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${currentRoleInfo.badge}`}>
                    {currentRoleInfo.label}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-center">
              <p className="text-xs text-blue-900 font-semibold">ยินดีต้อนรับสู่ Care Companion</p>
              <p className="text-[11px] text-blue-700 mt-0.5">เข้าสู่ระบบเพื่อจองหรือรับงานผู้ร่วมเดินทาง</p>
            </div>
          )}

          {/* Navigation Section */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              เมนูหลัก
            </div>
            {renderMobileNavLink('/', 'หน้าแรก', <Home className="w-4 h-4" />, isHomeActive, 'blue')}
            {renderMobileNavLink('/companions', 'ค้นหาผู้ร่วมเดินทาง', <Search className="w-4 h-4" />, isCompanionsActive, 'blue')}
            {(!currentUser || role === 'customer') && (
              renderMobileNavLink('/bookings/new', 'ขอรับบริการเดินทาง', <Calendar className="w-4 h-4" />, isBookingNewActive, 'blue')
            )}
          </div>

          {/* Role-Specific Portal Section */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              พื้นที่การทำงานเฉพาะบทบาท
            </div>

            {role === 'customer' && (
              renderMobileNavLink(
                '/customer/dashboard',
                'การจองของฉัน (ลูกค้า)',
                <Calendar className="w-4 h-4" />,
                isCustomerDashActive,
                'blue'
              )
            )}

            {role === 'companion' && (
              <>
                {/* Fixed: Active only when on /companion/dashboard, no longer stuck! */}
                {renderMobileNavLink(
                  '/companion/dashboard',
                  'งานที่ได้รับมอบหมาย',
                  <Briefcase className="w-4 h-4" />,
                  isCompanionDashActive,
                  'emerald'
                )}
                {renderMobileNavLink(
                  '/companion/profile',
                  'ข้อมูลบริการ (Companion)',
                  <FileText className="w-4 h-4" />,
                  isCompanionProfileActive,
                  'emerald'
                )}
              </>
            )}

            {role === 'admin' && (
              renderMobileNavLink(
                '/admin/dashboard',
                'แผงควบคุมผู้ดูแลระบบ (Admin)',
                <ShieldCheck className="w-4 h-4" />,
                isAdminDashActive,
                'purple'
              )
            )}
          </div>

          {/* Mobile Bottom Action: Auth */}
          <div className="pt-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ Google</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
