-- ==============================================================================
-- Migration: เพิ่มคอลัมน์เก็บภาพบัตรประชาชนและใบขับขี่แยกกัน
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ id_card_url และ driver_license_url ในตาราง companion_profiles
ALTER TABLE public.companion_profiles 
ADD COLUMN IF NOT EXISTS id_card_url TEXT,
ADD COLUMN IF NOT EXISTS driver_license_url TEXT;

-- 2. ย้ายข้อมูลเดิมจาก verification_doc_url ไปยัง id_card_url (ถ้ามี)
UPDATE public.companion_profiles
SET id_card_url = verification_doc_url
WHERE id_card_url IS NULL AND verification_doc_url IS NOT NULL;

COMMENT ON COLUMN public.companion_profiles.id_card_url IS 'URL หรือ Storage Path ของรูปบัตรประชาชน';
COMMENT ON COLUMN public.companion_profiles.driver_license_url IS 'URL หรือ Storage Path ของรูปใบขับขี่';
