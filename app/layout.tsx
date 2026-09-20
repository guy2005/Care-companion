import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Care Companion - ผู้ช่วยร่วมเดินทางและทำธุระสำหรับทุกคน',
  description: 'แพลตฟอร์มเชื่อมโยงผู้ที่ต้องการผู้ช่วยร่วมเดินทาง เช่น ผู้สูงอายุ หรือผู้ที่เดินทางคนเดียวไม่สะดวก ไปทำธุระนอกบ้านอย่างปลอดภัย',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
