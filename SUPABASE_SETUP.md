# คู่มือการตั้งค่า Supabase และ Google Authentication สำหรับ Care Companion

คู่มือนี้จะแนะนำขั้นตอนการตั้งค่า **Supabase PostgreSQL**, **Row Level Security (RLS)**, **Storage** และ **Google OAuth** สำหรับโปรเจกต์ Care Companion เพื่อนำไปใช้งานจริงและ Deploy บน Vercel

---

## ขั้นตอนที่ 1: สร้างโปรเจกต์บน Supabase

1. เข้าเว็บไซต์ [https://supabase.com](https://supabase.com) แล้วล็อกอินเข้าสู่ระบบ
2. กดปุ่ม **"New project"**
3. ตั้งชื่อโปรเจกต์ เช่น `care-companion`
4. ตั้งรหัสผ่าน Database Password (บันทึกเก็บไว้)
5. เลือก Region ใกล้เคียง (เช่น `Singapore (ap-southeast-1)`)
6. กด **"Create new project"** และรอระบบเตรียมฐานข้อมูลประมาณ 1-2 นาที

---

## ขั้นตอนที่ 2: รัน SQL Schema & RLS Policies (สำคัญมาก)

1. ในเมนูด้านซ้ายของ Supabase Dashboard ให้คลิกที่ **SQL Editor** (ไอคอน `>_`)
2. กดปุ่ม **"New query"**
3. คัดลอกโค้ดทั้งหมดจากไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ มาวางลงในช่อง Query
4. กดปุ่ม **"Run"** (หรือกด Ctrl+Enter)
   - ระบบจะสร้าง Tables ทั้งหมด: `profiles`, `companion_profiles`, `service_categories`, `bookings`, `reviews`
   - เปิดใช้งาน **Row Level Security (RLS)** พร้อม Policies ความปลอดภัยครบทุกตาราง
   - สร้าง Triggers สำหรับการสร้าง Profile อัตโนมัติเมื่อผู้ใช้ล็อกอินผ่าน Google
   - สร้าง Trigger คำนวณคะแนนรีวิวเฉลี่ยอัตโนมัติ
5. กดปุ่ม **"New query"** อีกครั้ง คัดลอกโค้ดจาก `supabase/seed.sql` มาวางแล้วกด **"Run"** เพื่อสร้างหมวดหมู่ธุระเริ่มต้น

---

## ขั้นตอนที่ 3: ตั้งค่า Google Authentication (Google OAuth)

เพื่อให้ผู้ใช้งาน Customer และ Companion สามารถเข้าสู่ระบบด้วย Google Account ตามที่โจทย์กำหนด:

### 3.1 ดึง Redirect URL จาก Supabase
1. ไปที่ Supabase Dashboard -> เมนู **Authentication** -> **Providers**
2. ค้นหา **Google** แล้วคลิกเพื่อเปิดการตั้งค่า
3. คัดลอกค่า **Callback URL (for OAuth)** ไว้ (รูปแบบจะเป็น `https://<project-ref>.supabase.co/auth/v1/callback`)

### 3.2 สร้าง Google OAuth Client ID บน Google Cloud Console
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่ หรือเลือกโปรเจกต์ที่มีอยู่
3. ไปที่ **APIs & Services** -> **OAuth consent screen**
   - User Type: เลือก **External** แล้วกด Create
   - กรอก App name (เช่น `Care Companion`), User support email, และ Developer contact email
   - กด Save and Continue ไปจนจบ
4. ไปที่ **APIs & Services** -> **Credentials**
   - กดปุ่ม **"+ CREATE CREDENTIALS"** -> เลือก **OAuth client ID**
   - Application type: เลือก **Web application**
   - Name: `Care Companion Web Client`
   - ในส่วน **Authorized JavaScript origins**:
     - ใส่ `http://localhost:3000` (สำหรับทดสอบในเครื่อง)
     - ใส่ URL ของ Vercel ที่ Deploy เช่น `https://care-companion.vercel.app`
   - ในส่วน **Authorized redirect URIs**:
     - วาง **Callback URL** ที่คัดลอกมาจาก Supabase ในขั้นตอน 3.1
   - กด **Create**
5. คัดลอก **Client ID** และ **Client secret** ที่ได้

### 3.3 นำ Client ID และ Client Secret ไปใส่ใน Supabase
1. กลับมาที่หน้า Supabase -> **Authentication** -> **Providers** -> **Google**
2. เปิดสวิตช์ **Enable Sign in with Google**
3. วาง **Client ID** และ **Client secret**
4. กด **Save**

---

## ขั้นตอนที่ 4: เชื่อมต่อ Environment Variables ใน Next.js

1. ไปที่ Supabase Dashboard -> เมนู **Project Settings** (ไอคอนฟันเฟือง) -> **API**
2. คัดลอกค่า:
   - **Project URL**
   - **Project API Keys** (anon / public)
3. ในโปรเจกต์ Next.js ให้สร้างไฟล์ `.env.local` ที่ Root Directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

---

## ขั้นตอนที่ 5: ตรวจสอบ Storage Buckets

ไฟล์ `supabase/schema.sql` ได้มีคำสั่งสร้าง Bucket ให้แล้ว แต่สามารถตรวจสอบเพิ่มเติมได้ที่:
1. เมนู **Storage** ใน Supabase Dashboard
2. ตรวจสอบว่ามี 2 Buckets ดังนี้:
   - `avatars` (Public: ON) - สำหรับเก็บภาพโปรไฟล์
   - `verification-docs` (Public: OFF) - สำหรับเก็บเอกสารตรวจสอบประวัติของผู้ร่วมเดินทาง

---

## หมายเหตุพิเศษสำหรับการทดสอบและการนำเสนอ (Demo Mode)

ในตัวโปรเจกต์ Next.js นี้ มีระบบ **"Demo / One-Click Role Switcher"** ติดตั้งมาให้ด้วย:
- หากยังไม่ได้ตั้งค่า Google OAuth หรือยังไม่ได้ใส่ API Key ของ Supabase ผู้ใช้และอาจารย์ผู้ตรวจสามารถคลิกปุ่ม **"ทดลองเข้าใช้งานทันที (Demo Account)"** เพื่อทดสอบระบบได้ทั้ง 3 บทบาท:
  - 👤 **Customer** (ทดสอบค้นหา Companion, สร้างคำขอร่วมเดินทาง, ดูประวัติ, ให้คะแนนรีวิว)
  - 🤝 **Companion** (ทดสอบรับงาน, ปฏิเสธงาน, กดเปลี่ยนสถานะเดินทาง, แก้ไขประวัติและพื้นที่บริการ)
  - 🛡️ **Admin** (ทดสอบดูภาพรวมสถิติ, อนุมัติผู้ร่วมเดินทาง, จัดการผู้ใช้)
