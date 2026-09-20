import React from 'react';
import { BookingStatus } from '@/lib/types';
import { Clock, CheckCircle2, Navigation, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <Clock className="w-3.5 h-3.5" />
          รอการตอบรับ
        </span>
      );
    case 'accepted':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          ตอบรับแล้ว / รอนัดหมาย
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 animate-pulse ${className}`}>
          <Navigation className="w-3.5 h-3.5" />
          กำลังเดินทาง / ปฏิบัติงาน
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          สิ้นสุดบริการเรียบร้อย
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <XCircle className="w-3.5 h-3.5" />
          ยกเลิกรายการ
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      );
  }
}
