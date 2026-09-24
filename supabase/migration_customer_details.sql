-- ==============================================================================
-- Care Companion - Migration Script: ข้อมูลผู้รับบริการ, อายุ, การเคลื่อนไหว และเบอร์ฉุกเฉิน
-- รันคำสั่งนี้ใน Supabase Dashboard > SQL Editor เพื่ออัปเกรดฐานข้อมูล
-- ==============================================================================

-- 1. เพิ่มฟิลด์ในตาราง profiles (สำหรับบันทึกข้อมูลพื้นฐานของ Customer)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

COMMENT ON COLUMN public.profiles.age IS 'อายุของเจ้าของบัญชีผู้ใช้งาน';
COMMENT ON COLUMN public.profiles.gender IS 'เพศของผู้ใช้งาน (เช่น male, female, other)';
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'ชื่อผู้ติดต่อฉุกเฉิน';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'เบอร์โทรศัพท์ติดต่อฉุกเฉิน';

-- 2. เพิ่มฟิลด์ในตาราง bookings (สำหรับบันทึกรายละเอียดผู้ร่วมเดินทางและสุขภาพเฉพาะแต่ละทริป)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS is_for_other BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS passenger_name TEXT,
ADD COLUMN IF NOT EXISTS passenger_age INT,
ADD COLUMN IF NOT EXISTS passenger_gender TEXT,
ADD COLUMN IF NOT EXISTS mobility_level TEXT DEFAULT 'independent',
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS medical_notes TEXT;

COMMENT ON COLUMN public.bookings.is_for_other IS 'ระบุว่าเป็นการจองให้ตัวเอง (FALSE) หรือจองให้ผู้อื่น เช่น คุณพ่อ/คุณแม่/ญาติ (TRUE)';
COMMENT ON COLUMN public.bookings.passenger_name IS 'ชื่อ-นามสกุลของผู้รับบริการเดินทางจริง';
COMMENT ON COLUMN public.bookings.passenger_age IS 'อายุของผู้รับบริการเดินทางจริง';
COMMENT ON COLUMN public.bookings.passenger_gender IS 'เพศของผู้เดินทางจริง';
COMMENT ON COLUMN public.bookings.mobility_level IS 'ระดับการเคลื่อนไหว: independent (เดินปกติ), needs_cane (ใช้ไม้เท้า/พยุง), wheelchair (นั่งวีลแชร์), bedridden (ติดเตียง/พิเศษ)';
COMMENT ON COLUMN public.bookings.emergency_contact_name IS 'ชื่อผู้ติดต่อฉุกเฉินสำหรับทริปนี้';
COMMENT ON COLUMN public.bookings.emergency_contact_phone IS 'เบอร์โทรศัพท์ติดต่อฉุกเฉินสำหรับทริปนี้';
COMMENT ON COLUMN public.bookings.medical_notes IS 'ข้อมูลสุขภาพเบื้องต้น โรคประจำตัว หรือยาที่ต้องพกติดตัว';

-- 3. ตรวจสอบโครงสร้างตารางหลังการรัน
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'bookings')
ORDER BY table_name, ordinal_position;
