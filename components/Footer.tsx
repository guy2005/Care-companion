import React from 'react';
import Link from 'next/link';
import { HeartHandshake, ShieldAlert, Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Essential Medical Disclaimer required by assignment */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-xs sm:text-sm text-amber-200 text-center">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>ข้อควรทราบ:</strong> ผู้ร่วมเดินทาง (Companion) มีหน้าที่ช่วยเหลือและอำนวยความสะดวกในการเดินทางและการทำธุระเท่านั้น <strong>ไม่ใช่ผู้ให้บริการทางการแพทย์หรือผู้ดูแลรักษาผู้ป่วย</strong>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Care Companion</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              แพลตฟอร์มตัวกลางเพื่อเชื่อมโยงผู้ที่ต้องการผู้ช่วยร่วมเดินทาง เช่น ผู้สูงอายุและผู้ที่เดินทางคนเดียวไม่สะดวก ไปทำธุระนอกบ้านอย่างอุ่นใจและปลอดภัย
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">ประเภทบริการ</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/companions" className="hover:text-white transition">พาไปพบแพทย์ตามนัด / รพ.</Link></li>
              <li><Link href="/companions" className="hover:text-white transition">พาไปธนาคาร / ติดต่อราชการ</Link></li>
              <li><Link href="/companions" className="hover:text-white transition">พาซื้อสินค้า / ซูเปอร์มาร์เก็ต</Link></li>
              <li><Link href="/companions" className="hover:text-white transition">ร่วมเดินทางทำธุระทั่วไป</Link></li>
            </ul>
          </div>

          {/* Col 3: Role Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">เข้าสู่ส่วนการทำงาน</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/customer/dashboard" className="hover:text-blue-400 transition">👤 สำหรับลูกค้า (Customer)</Link></li>
              <li><Link href="/companion/dashboard" className="hover:text-emerald-400 transition">🤝 สำหรับผู้ร่วมเดินทาง (Companion)</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-purple-400 transition">🛡️ สำหรับผู้ดูแลระบบ (Admin)</Link></li>
              <li><Link href="/login" className="hover:text-white transition">เข้าสู่ระบบด้วย Google</Link></li>
            </ul>
          </div>

          {/* Col 4: Project Info & Tech Stack */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">ข้อมูลระบบ & เทคโนโลยี</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Framework: Next.js (App Router)</li>
              <li>Styling: TailwindCSS</li>
              <li>Authentication: Supabase Auth (Google)</li>
              <li>Database: Supabase PostgreSQL + RLS</li>
              <li>Deployment: Vercel Ready</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Care Companion Web Application. พัฒนาเพื่อการศึกษาและการสอบ Midterm.</p>
          <div className="flex items-center gap-1">
            <span>สร้างด้วยความใส่ใจเพื่อความปลอดภัยของผู้สูงอายุ</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
