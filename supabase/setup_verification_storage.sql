-- ==============================================================================
-- Supabase Storage Setup: verification-docs (Private Bucket)
-- สำหรับเก็บเอกสารยืนยันตัวตนของผู้ช่วยร่วมเดินทาง (บัตรประชาชน / ใบขับขี่)
-- ==============================================================================

-- 1. สร้าง Bucket ชื่อ verification-docs (กำหนด public = false เพื่อความปลอดภัยตาม PDPA)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-docs',
    'verification-docs',
    false,
    5242880, -- จำกัดขนาดไม่เกิน 5 MB (5 * 1024 * 1024)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- 2. ลบ Policies เก่าถ้ามีอยู่ เพื่อความสะอาด
DROP POLICY IF EXISTS "Users can upload their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users and Admins can view verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Only doc owner and admin can view verification docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload verification docs" ON storage.objects;

-- 3. Policy: อนุญาตให้ Companion อัปโหลดไฟล์ได้เฉพาะใน Folder ของตนเอง ({auth.uid}/...)
CREATE POLICY "Users can upload their own verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verification-docs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: อนุญาตให้ Companion แก้ไข/อัปโหลดทับไฟล์เดิมของตนเองได้
CREATE POLICY "Users can update their own verification docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'verification-docs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'verification-docs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: สิทธิ์การดูเอกสาร (เจ้าของโฟลเดอร์ดูได้ และ แอดมินดูได้ทุกคน)
CREATE POLICY "Users and Admins can view verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'verification-docs' 
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

-- 6. Policy: เจ้าของเอกสารหรือแอดมินสามารถลบไฟล์ได้
CREATE POLICY "Users can delete their own verification docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'verification-docs' 
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);
