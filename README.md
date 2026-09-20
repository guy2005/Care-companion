# Care Companion - Web Application by Next.js & Supabase

**Care Companion** คือแพลตฟอร์มตัวกลางเชื่อมโยงระหว่าง **ผู้ที่ต้องการผู้ช่วยร่วมเดินทาง (Customer)** เช่น ผู้สูงอายุ หรือผู้ที่เดินทางคนเดียวไม่สะดวกไปทำธุระนอกบ้าน (ไปพบแพทย์ตามนัด, ไปธนาคาร, ติดต่อหน่วยงานราชการ, ซื้อสินค้า) กับ **ผู้ให้บริการร่วมเดินทาง (Companion)** พร้อมระบบจัดการภาพรวมสำหรับ **Admin**

> ⚠️ **ข้อควรทราบตามข้อกำหนดโจทย์:** Companion มีหน้าที่ช่วยเหลือและอำนวยความสะดวกในการเดินทางและการทำธุระเท่านั้น **ไม่ใช่ผู้ให้บริการทางการแพทย์หรือผู้ดูแลรักษาผู้ป่วย**

---

## 🛠️ Tech Stack ตามที่กำหนดในโจทย์

- **Frontend / Full Stack**: [Next.js](https://nextjs.org/) (App Router, TypeScript) + [TailwindCSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Authentication**: Google Account ทำงานร่วมกับ [Supabase Authentication](https://supabase.com/docs/guides/auth)
- **Database**: [Supabase PostgreSQL](https://supabase.com/docs/guides/database) พร้อม Row Level Security (RLS)
- **File Storage**: [Supabase Storage](https://supabase.com/docs/guides/storage) สำหรับรูปโปรไฟล์และเอกสารยืนยันตัวตน
- **Deployment**: ออกแบบและเตรียมพร้อมสำหรับ Deploy บน [Vercel](https://vercel.com/)

---

## 👥 บทบาทผู้ใช้งานในระบบ (3 Roles)

1. **Customer (ลูกค้า / ผู้ขอรับบริการ)**
   - เข้าชมข้อมูลเบื้องต้นและค้นหา Companion
   - ระบุความต้องการ: ประเภทธุระ, วัน-เวลา, ต้นทาง, ปลายทาง, ระยะเวลา, ความต้องการพิเศษ
   - สร้างคำขอนัดหมาย ติดตามสถานะงานแบบ Real-time
   - สิ้นสุดบริการและเขียนรีวิวให้คะแนนดาว (1-5 ดาว)
2. **Companion (ผู้ร่วมเดินทาง)**
   - นำเสนอข้อมูลตนเอง ประสบการณ์ ทักษะ พื้นที่บริการ และอัตราค่าบริการต่อชั่วโมง
   - เปิด/ปิด สถานะพร้อมรับงาน (Available / Busy)
   - ดูรายการคำขอ และกด **"ตอบรับ (Accept)"** หรือ **"ปฏิเสธ (Decline)"**
   - อัปเดตสถานะการเดินทาง: `accepted` ➔ `in_progress` (กำลังเดินทาง) ➔ `completed` (เสร็จสิ้น)
   - สรุปรายได้สะสมและประวัติงานที่สำเร็จ
3. **Admin (ผู้ดูแลระบบกลาง)**
   - ดูสถิติภาพรวม: ผู้ใช้งานรวม, Companion ที่อนุมัติแล้ว, คำขอนัดหมายรวม, มูลค่าบริการ
   - จัดการตรวจสอบและอนุมัติผู้ร่วมเดินทาง (Approve / Revoke Verification)
   - ติดตามและยกเลิกคำขอที่ผิดปกติ
   - ตรวจสอบรายชื่อผู้ใช้งานทั้งหมด

---

## 📂 โครงสร้างโฟลเดอร์โปรเจกต์

```
care-companion/
├── app/
│   ├── layout.tsx                # Root layout พร้อม Navbar, Footer, Context Provider
│   ├── page.tsx                  # Landing Page แนะนำระบบ ค้นหาเบื้องต้น หมวดหมู่ธุระ
│   ├── login/page.tsx            # หน้าเข้าสู่ระบบ Google Account + One-Click Demo
│   ├── onboarding/page.tsx       # เลือกระหว่าง Customer หรือ Companion
│   ├── auth/callback/route.ts    # Supabase OAuth Route Handler
│   ├── companions/
│   │   ├── page.tsx              # ค้นหาและกรอง Companion (พื้นที่, ราคา, ทักษะ, รีวิว)
│   │   └── [id]/page.tsx         # รายละเอียด Companion, ประวัติ, ทักษะ, รีวิว และปุ่มจอง
│   ├── bookings/
│   │   └── new/page.tsx          # ฟอร์มระบุความต้องการเดินทางและคำนวณค่าบริการ
│   ├── customer/
│   │   └── dashboard/page.tsx    # แดชบอร์ดลูกค้า (ติดตามงาน, ยกเลิก, เขียนรีวิว)
│   ├── companion/
│   │   ├── dashboard/page.tsx    # แดชบอร์ดผู้ช่วย (รับงาน, ปรับสถานะเดินทาง, สรุปรายได้)
│   │   └── profile/page.tsx      # แก้ไขโปรไฟล์ ทักษะ พื้นที่บริการ ค่าบริการ
│   └── admin/
│       └── dashboard/page.tsx    # แดชบอร์ดแอดมิน (KPIs, อนุมัติ Companion, ตรวจสอบงาน)
├── components/
│   ├── Navbar.tsx                # แถบนำทางพร้อม Role Badge และปุ่มสลับบทบาททดสอบ
│   ├── Footer.tsx                # ส่วนท้ายเว็บพร้อมข้อควรทราบทางการแพทย์
│   ├── CompanionCard.tsx         # การ์ดแสดงผู้ช่วยร่วมเดินทาง
│   └── StatusBadge.tsx           # ป้ายสถานะงานพร้อมสีและไอคอน
├── lib/
│   ├── types.ts                  # TypeScript Interfaces ทั้งหมด
│   ├── mockData.ts               # ข้อมูลตัวอย่างสมจริงสำหรับโหมดนำเสนอ/ทดสอบ
│   ├── context/AppContext.tsx    # จัดการ State, Auth และฟังก์ชันเชื่อมต่อ Supabase
│   └── supabase/                 # Supabase client helpers (client.ts, server.ts)
└── supabase/
    ├── schema.sql                # คำสั่ง SQL สร้าง Tables, Functions, Triggers และ RLS Policies
    └── seed.sql                  # ข้อมูลหมวดหมู่บริการเริ่มต้น
```

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. กำหนดตัวแปร Environment Variables (ถ้าต้องการเชื่อมต่อ Supabase จริง)
คัดลอกไฟล์ตัวอย่าง `.env.local.example` เป็น `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
*(ดูขั้นตอนการตั้งค่า Supabase ฉบับเต็มได้ในไฟล์ [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md))*

### 3. รัน Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

> 💡 **ฟีเจอร์เด่นสำหรับการตรวจและนำเสนอ (Presentation Mode):**
> ด้านบนสุดของ Navbar จะมีแถบ **"โหมดทดสอบระบบสำหรับตรวจงาน & การนำเสนอ"** ซึ่งสามารถคลิกสลับบทบาทได้ทันทีระหว่าง:
> - 👤 **Customer** (คุณสมชาย)
> - 🤝 **Companion** (ครูปรียา)
> - 🛡️ **Admin** (แอดมินระบบกลาง)
> ทำให้ผู้ตรวจสามารถทดลองเล่นทุกฟังก์ชันได้ทันทีอย่างครบถ้วน

---

## ☁️ วิธีการ Deploy บน Vercel

1. สร้าง Repository บน GitHub แล้ว Push โค้ดทั้งหมดขึ้นไป
2. ไปที่ [Vercel](https://vercel.com) แล้วกด **"Add New Project"**
3. เลือก Repository `care-companion`
4. ในส่วน **Environment Variables** ให้ใส่:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. กดปุ่ม **"Deploy"**
6. นำ URL ที่ได้จาก Vercel ไปใส่ใน Google Cloud Console ในส่วน **Authorized JavaScript origins**
