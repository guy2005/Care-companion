-- ==============================================================================
-- Care Companion - Supabase PostgreSQL Schema & Security Policies (RLS)
-- Web Application for Midterm Assignment
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Table 1: Profiles (ขยายจาก auth.users รองรับ Google Account)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('customer', 'companion', 'admin')) DEFAULT 'customer',
    age INT,
    gender TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'ข้อมูลบัญชีผู้ใช้งานระบบ Care Companion (Customer, Companion, Admin)';

-- Table 2: Companion Profiles (ข้อมูลเฉพาะของผู้ร่วมเดินทาง)
CREATE TABLE IF NOT EXISTS public.companion_profiles (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    bio TEXT DEFAULT '',
    experience_years INT DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    service_areas TEXT[] DEFAULT '{}',
    hourly_rate NUMERIC(10, 2) DEFAULT 250.00,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_doc_url TEXT,
    id_card_url TEXT,
    driver_license_url TEXT,
    experience_doc_1_url TEXT,
    experience_doc_2_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00,
    rating_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.companion_profiles IS 'ข้อมูลประวัติ ประสบการณ์ ทักษะ พื้นที่บริการ และค่าบริการของผู้ร่วมเดินทาง';

-- Table 3: Service Categories (หมวดหมู่ประเภทธุระ)
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.service_categories IS 'ประเภทของธุระ เช่น ไปพบแพทย์/รพ., ไปธนาคาร/ราชการ, ช้อปปิ้ง';

-- Table 4: Bookings (รายการนัดหมายและคำขอร่วมเดินทาง)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    companion_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    origin_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_hours NUMERIC(4, 2) DEFAULT 2.0 NOT NULL,
    estimated_cost NUMERIC(10, 2) DEFAULT 500.00 NOT NULL,
    special_notes TEXT,
    -- Customer & Passenger Care Info
    customer_phone TEXT,
    is_for_other BOOLEAN DEFAULT FALSE,
    passenger_name TEXT,
    passenger_age INT,
    passenger_gender TEXT,
    mobility_level TEXT DEFAULT 'independent',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_notes TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.bookings IS 'คำขอและรายการนัดหมายร่วมเดินทาง พร้อมขั้นตอนสถานะ';

-- Table 5: Reviews (รีวิวและการให้คะแนน)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    companion_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE public.reviews IS 'คะแนนและรีวิวหลังจบการเดินทาง';

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_companion_verified ON public.companion_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_companion_available ON public.companion_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_companion ON public.bookings(companion_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_companion ON public.reviews(companion_id);

-- ==============================================================================
-- 4. FUNCTIONS AND TRIGGERS
-- ==============================================================================

-- Function 1: อัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER tr_companion_profiles_updated_at
BEFORE UPDATE ON public.companion_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER tr_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function 2: สร้างโปรไฟล์ให้อัตโนมัติเมื่อ User ล็อกอินครั้งแรกผ่าน Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');

    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'ผู้ใช้งาน'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        user_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
        avatar_url = CASE WHEN profiles.avatar_url IS NULL OR profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END;

    -- ถ้าเป็น Companion ให้สร้าง record ใน companion_profiles ด้วย
    IF user_role = 'companion' THEN
        INSERT INTO public.companion_profiles (id)
        VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function 3: คำนวณคะแนนเฉลี่ย Companion อัตโนมัติเมื่อมีรีวิวใหม่
CREATE OR REPLACE FUNCTION public.update_companion_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_companion_id UUID;
    new_avg NUMERIC(3, 2);
    new_count INT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_companion_id := OLD.companion_id;
    ELSE
        target_companion_id := NEW.companion_id;
    END IF;

    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00), COUNT(*)
    INTO new_avg, new_count
    FROM public.reviews
    WHERE companion_id = target_companion_id;

    UPDATE public.companion_profiles
    SET rating_avg = new_avg,
        rating_count = new_count
    WHERE id = target_companion_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_update_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_companion_rating();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper check function: ตรวจสอบว่าเป็น Admin หรือไม่
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 5.1 RLS FOR: profiles
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ทุกคนอ่านโปรไฟล์ได้ (จำเป็นสำหรับการแสดงชื่อ Companion และ Customer ในการจอง)
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- ผู้ใช้สร้างโปรไฟล์ตนเองได้
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- ผู้ใช้แก้ไขโปรไฟล์ตนเองได้ หรือ Admin แก้ไขได้ทุกคน
CREATE POLICY "Users can update own profile or admin can update all" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.2 RLS FOR: companion_profiles
-- ------------------------------------------------------------------------------
ALTER TABLE public.companion_profiles ENABLE ROW LEVEL SECURITY;

-- ข้อมูลผู้ร่วมเดินทางเปิดให้อ่านแบบ Public เพื่อให้ลูกค้าค้นหาได้
CREATE POLICY "Companion profiles viewable by everyone" 
ON public.companion_profiles FOR SELECT 
USING (true);

-- Companion สร้างโปรไฟล์ตนเอง
CREATE POLICY "Companion can insert own profile" 
ON public.companion_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Companion แก้ไขโปรไฟล์ตนเอง หรือ Admin อัปเดตการอนุมัติ (Verify)
CREATE POLICY "Companion can update own profile or admin can update" 
ON public.companion_profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.3 RLS FOR: service_categories
-- ------------------------------------------------------------------------------
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- ทุกคนดูประเภทของบริการได้
CREATE POLICY "Service categories viewable by everyone" 
ON public.service_categories FOR SELECT 
USING (true);

-- เฉพาะ Admin เท่านั้นที่เพิ่ม/แก้ไขประเภทบริการ
CREATE POLICY "Only admin can modify service categories" 
ON public.service_categories FOR ALL 
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5.4 RLS FOR: bookings
-- ------------------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- นโยบายการดูรายการ Booking:
-- 1. Customer ดูงานของตนเอง
-- 2. Companion ดูงานที่ตนรับ หรือ งานเปิดรับ (status = 'pending')
-- 3. Admin ดูงานทั้งหมด
CREATE POLICY "Users can view relevant bookings" 
ON public.bookings FOR SELECT 
USING (
    auth.uid() = customer_id 
    OR auth.uid() = companion_id 
    OR (companion_id IS NULL AND status = 'pending')
    OR public.is_admin()
);

-- Customer เป็นผู้สร้างคำขอจอง
CREATE POLICY "Customers can create bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- นโยบายการอัปเดตสถานะ Booking:
-- 1. Customer แก้ไขหรือยกเลิกคำขอตนเองได้
-- 2. Companion กดรับงาน หรืออัปเดตสถานะ เช่น 'in_progress', 'completed'
-- 3. Admin จัดการได้ทุกสถานะ
CREATE POLICY "Users can update relevant bookings" 
ON public.bookings FOR UPDATE 
USING (
    auth.uid() = customer_id 
    OR auth.uid() = companion_id 
    OR (companion_id IS NULL AND status = 'pending')
    OR public.is_admin()
)
WITH CHECK (
    auth.uid() = customer_id 
    OR auth.uid() = companion_id 
    OR auth.uid() = companion_id 
    OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- 5.5 RLS FOR: reviews
-- ------------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- รีวิวเปิดให้อ่านแบบ Public
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- Customer ที่เป็นผู้จองในงานที่เสร็จสิ้นแล้วเท่านั้นที่รีวิวได้
CREATE POLICY "Customers can add review after completed trip" 
ON public.reviews FOR INSERT 
WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
        SELECT 1 FROM public.bookings b 
        WHERE b.id = booking_id 
          AND b.status = 'completed'
          AND b.customer_id = auth.uid()
    )
);

-- เจ้าของรีวิวหรือ Admin เท่านั้นที่แก้ไขหรือลบรีวิวได้
CREATE POLICY "Review author or admin can modify" 
ON public.reviews FOR ALL 
USING (auth.uid() = customer_id OR public.is_admin());

-- ==============================================================================
-- 6. STORAGE BUCKETS CONFIGURATION (Optional: Run if storage schema exists)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: avatars (Public read, authenticated upload)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Storage Policies: verification-docs (Private, only owner and admin)
CREATE POLICY "Users can upload verification docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verification-docs' AND auth.role() = 'authenticated');

CREATE POLICY "Only doc owner and admin can view verification docs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'verification-docs' 
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
);
