'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  X
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, role, loginAsDemo, signOut } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'customer':
        return { label: 'ลูกค้า (Customer)', badge: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'companion':
        return { label: 'ผู้ร่วมเดินทาง (Companion)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'admin':
        return { label: 'ผู้ดูแลระบบ (Admin)', badge: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
  };

  const currentRoleInfo = getRoleLabel(role);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* Top Demo Helper Bar for Evaluation & Easy Presentation */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>โหมดทดสอบระบบสำหรับตรวจงาน & การนำเสนอ (สลับบทบาทได้ทันที):</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loginAsDemo('customer')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
                role === 'customer'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              👤 Customer (สมชาย)
            </button>
            <button
              onClick={() => loginAsDemo('companion')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
                role === 'companion'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              🤝 Companion (ครูปรียา)
            </button>
            <button
              onClick={() => loginAsDemo('admin')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
                role === 'admin'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              🛡️ Admin (ระบบกลาง)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
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
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                pathname === '/'
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              หน้าแรก
            </Link>
            <Link
              href="/companions"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                pathname.startsWith('/companions')
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              ค้นหาผู้ร่วมเดินทาง
            </Link>
            <Link
              href="/bookings/new"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                pathname === '/bookings/new'
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              ขอรับบริการเดินทาง
            </Link>

            {/* Role-Specific Dashboard Links */}
            {role === 'customer' && (
              <Link
                href="/customer/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith('/customer')
                    ? 'text-blue-600 bg-blue-50/80 font-semibold'
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
                    pathname === '/companion/dashboard'
                      ? 'text-emerald-600 bg-emerald-50/80 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  งานที่ได้รับมอบหมาย
                </Link>
                <Link
                  href="/companion/profile"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === '/companion/profile'
                      ? 'text-emerald-600 bg-emerald-50/80 font-semibold'
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
                  pathname.startsWith('/admin')
                    ? 'text-purple-600 bg-purple-50/80 font-semibold'
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
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition"
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
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
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          แดชบอร์ดลูกค้า
                        </Link>
                      )}
                      {role === 'companion' && (
                        <Link
                          href="/companion/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          แดชบอร์ดผู้ร่วมเดินทาง
                        </Link>
                      )}
                      {role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700"
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
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                เข้าสู่ระบบ Google
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            หน้าแรก
          </Link>
          <Link
            href="/companions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            ค้นหาผู้ร่วมเดินทาง
          </Link>
          <Link
            href="/bookings/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            ขอรับบริการเดินทาง
          </Link>

          {role === 'customer' && (
            <Link
              href="/customer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-blue-600 bg-blue-50"
            >
              การจองของฉัน
            </Link>
          )}

          {role === 'companion' && (
            <>
              <Link
                href="/companion/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-600 bg-emerald-50"
              >
                งานที่ได้รับมอบหมาย
              </Link>
              <Link
                href="/companion/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-600 hover:bg-emerald-50"
              >
                แก้ไขข้อมูลบริการ
              </Link>
            </>
          )}

          {role === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-600 bg-purple-50"
            >
              แผงควบคุมผู้ดูแลระบบ
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-center font-medium text-rose-600 bg-rose-50 hover:bg-rose-100"
              >
                ออกจากระบบ ({currentUser.full_name})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 px-4 rounded-xl text-center font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                เข้าสู่ระบบ Google
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
