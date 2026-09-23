'use client';

import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Info, 
  X 
} from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'primary';
  isAlertOnly?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'danger',
  isAlertOnly = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const iconMap = {
    danger: <XCircle className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    primary: <Info className="w-6 h-6 text-blue-600" />,
  };

  const bgIconMap = {
    danger: 'bg-rose-50 border border-rose-100',
    warning: 'bg-amber-50 border border-amber-100',
    success: 'bg-emerald-50 border border-emerald-100',
    primary: 'bg-blue-50 border border-blue-100',
  };

  const confirmBtnClass = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 active:scale-95',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 active:scale-95',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-95',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 active:scale-95',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={onCancel} 
        aria-hidden="true" 
      />
      {/* Modal Dialog Card */}
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 z-10"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${bgIconMap[variant]}`}>
            {iconMap[variant]}
          </div>
          <div className="space-y-1.5 flex-1 pr-4">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <div className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {!isAlertOnly && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${confirmBtnClass[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
