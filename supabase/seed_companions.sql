-- ==============================================================================
-- Care Companion - Seed Companions, Reviews, Bookings & RLS Policies
-- รันไฟล์นี้ใน Supabase SQL Editor (กดปุ่ม Run เพื่อเพิ่มข้อมูลและเปิดสิทธิ์ RLS)
-- ==============================================================================

-- 1. ปลด Foreign Key ของ profiles.id ไปยัง auth.users เพื่อให้บันทึก Companion Seed Data ใน profiles ได้
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. ปรับแต่ง RLS Policies ให้สามารถอ่าน-เขียน-แก้ไขได้ทั้ง Admin และผู้ใช้งาน (เพื่อรองรับการกดอนุมัติ/เพิกถอนในแดชบอร์ด)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admin can update all" ON public.profiles;
DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.companion_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Companion profiles viewable by everyone" ON public.companion_profiles;
DROP POLICY IF EXISTS "Companion can insert own profile" ON public.companion_profiles;
DROP POLICY IF EXISTS "Companion can update own profile or admin can update" ON public.companion_profiles;
DROP POLICY IF EXISTS "Allow all on companion_profiles" ON public.companion_profiles;
CREATE POLICY "Allow all on companion_profiles" ON public.companion_profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view relevant bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update relevant bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all on bookings" ON public.bookings;
CREATE POLICY "Allow all on bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Customers can add review after completed trip" ON public.reviews;
DROP POLICY IF EXISTS "Review author or admin can modify" ON public.reviews;
DROP POLICY IF EXISTS "Allow all on reviews" ON public.reviews;
CREATE POLICY "Allow all on reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 3. เพิ่มข้อมูลผู้ใช้งานและผู้ร่วมเดินทาง (Profiles) เข้าสู่ Supabase
INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, role)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'preeya.companion@gmail.com', 
        'คุณปรียา รักดูแล (ครูปรียา)', 
        '089-876-5432', 
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80', 
        'companion'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'thanakorn.companion@gmail.com', 
        'คุณธนกร ร่วมทาง (พี่กร)', 
        '086-555-1234', 
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80', 
        'companion'
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        'napha.care@gmail.com', 
        'คุณนภา แสนสุข (พี่นภา)', 
        '082-999-4321', 
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80', 
        'companion'
    ),
    (
        '44444444-4444-4444-4444-444444444444', 
        'worawit.care@gmail.com', 
        'คุณวรวิทย์ มิตรแท้', 
        '084-111-2233', 
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80', 
        'companion'
    ),
    (
        '55555555-5555-5555-5555-555555555555', 
        'somchai.care@gmail.com', 
        'คุณสมชาย ใจดี', 
        '081-234-5678', 
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80', 
        'customer'
    )
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role;

-- 4. เพิ่มข้อมูลประวัติและความสามารถของผู้ร่วมเดินทาง (companion_profiles)
-- สังเกต: คุณปรียา, คุณธนกร, คุณนภา -> is_verified = TRUE (อนุมัติแล้ว)
-- คุณวรวิทย์ มิตรแท้ -> is_verified = FALSE (รอแอดมินอนุมัติ / ยังไม่ได้รับเข้างาน ตามโจทย์)
INSERT INTO public.companion_profiles (
    id, 
    bio, 
    experience_years, 
    skills, 
    service_areas, 
    hourly_rate, 
    is_verified, 
    is_available, 
    rating_avg, 
    rating_count
)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'อดีตเจ้าหน้าที่ประชาสัมพันธ์โรงพยาบาล มีความใจเย็น สุภาพ ช่วยพยุงและเข็นรถเข็นได้คล่องแคล่ว คุ้นเคยกับแผนกและการติดต่อในโรงพยาบาลศิริราช จุฬาฯ และรามาธิบดี',
        4,
        ARRAY['เข็นรถเข็นผู้สูงอายุ', 'คุ้นเคยระบบโรงพยาบาล', 'ปฐมพยาบาลเบื้องต้น CPR', 'สื่อสารภาษาอังกฤษเบื้องต้น'],
        ARRAY['กรุงเทพฯ - พญาไท', 'กรุงเทพฯ - จตุจักร', 'กรุงเทพฯ - บางกอกน้อย', 'กรุงเทพฯ - ปทุมวัน'],
        250.00,
        TRUE,
        TRUE,
        4.95,
        28
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'มีรถยนต์ส่วนตัวพร้อมใบขับขี่ถูกต้อง สะอาดปลอดภัย ช่วยยกสัมภาระหนักได้ ช่วยนำทางและพาติดต่อธนาคาร สำนักงานเขต สำนักงานที่ดิน อย่างคล่องแคล่วและตรงต่อเวลา',
        3,
        ARRAY['มีรถยนต์ส่วนตัว', 'ช่วยยกของหนัก', 'เชี่ยวชาญการติดต่อหน่วยงานราชการ', 'ขับรถสุภาพ ปลอดภัย'],
        ARRAY['กรุงเทพฯ - บางนา', 'กรุงเทพฯ - สุขุมวิท', 'สมุทรปราการ - บางพลี', 'กรุงเทพฯ - วัฒนา'],
        300.00,
        TRUE,
        TRUE,
        4.88,
        34
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'ถนัดการพาผู้สูงอายุไปซื้อของที่ตลาดสดและซูเปอร์มาร์เก็ต ช่วยเช็ครายการสินค้า ตรวจวันหมดอายุ และดูแลเรื่องการใช้จ่ายอย่างละเอียดซื่อสัตย์ อารมณ์ดี ชวนคุยไม่เหงา',
        2,
        ARRAY['ช่วยเลือกซื้อสินค้า', 'ช่วยจัดแจงสัมภาระ', 'ดูแลผู้สูงอายุอย่างใส่ใจ', 'ถ่ายภาพรายงานญาติ'],
        ARRAY['กรุงเทพฯ - ธนบุรี', 'กรุงเทพฯ - คลองสาน', 'กรุงเทพฯ - บางกอกใหญ่'],
        220.00,
        TRUE,
        TRUE,
        5.00,
        15
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'ผู้ช่วยรุ่นใหม่ อารมณ์ดี พร้อมช่วยเหลือการเดินทางด้วยรถไฟฟ้า BTS / MRT และพาทำธุระทั่วไป เอกสารตรวจประวัติอยู่ระหว่างการตรวจสอบโดยแอดมิน',
        1,
        ARRAY['นำทางรถไฟฟ้า BTS/MRT', 'ช่วยใช้งานสมาร์ทโฟน/แอปพลิเคชัน', 'พาเดินออกกำลังกาย'],
        ARRAY['กรุงเทพฯ - ลาดพร้าว', 'กรุงเทพฯ - บางกะปิ', 'กรุงเทพฯ - ห้วยขวาง'],
        200.00,
        FALSE,
        TRUE,
        4.70,
        6
    )
ON CONFLICT (id) DO UPDATE SET
    bio = EXCLUDED.bio,
    experience_years = EXCLUDED.experience_years,
    skills = EXCLUDED.skills,
    service_areas = EXCLUDED.service_areas,
    hourly_rate = EXCLUDED.hourly_rate,
    is_verified = EXCLUDED.is_verified,
    is_available = EXCLUDED.is_available,
    rating_avg = EXCLUDED.rating_avg,
    rating_count = EXCLUDED.rating_count;

-- 5. เพิ่มตัวอย่าง Bookings ที่สำเร็จแล้วเพื่อให้ผูก Foreign Key กับ Reviews ได้
INSERT INTO public.bookings (
    id, customer_id, companion_id, service_category_id, 
    title, description, origin_location, destination_location, 
    scheduled_date, scheduled_time, duration_hours, estimated_cost, status
)
VALUES
    (
        'b1111111-1111-1111-1111-111111111111',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'พาคุณแม่ไปพบแพทย์ตามนัด คลินิกตา',
        'ต้องการผู้ช่วยพาไปตรวจตาตามนัด คุณแม่เดินช้าและต้องหยอดยาขยายม่านตา',
        'คอนโดลุมพินี พหลโยธิน 24',
        'โรงพยาบาลรามาธิบดี ถ.พระราม 6',
        '2026-09-18',
        '08:30:00',
        3.5,
        875.00,
        'completed'
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        '55555555-5555-5555-5555-555555555555',
        '22222222-2222-2222-2222-222222222222',
        'b2222222-2222-2222-2222-222222222222',
        'ไปติดต่อรับเงินบำนาญและอัปเดตสมุดบัญชี',
        'ไปธนาคารกรุงไทย สาขาสยามพารากอน และทำบัตรประชาชนใหม่ที่จุดบริการเขต',
        'ซอยสุขุมวิท 39',
        'สยามพารากอน ชั้น 4',
        '2026-09-17',
        '13:00:00',
        2.0,
        600.00,
        'completed'
    ),
    (
        'b3333333-3333-3333-3333-333333333333',
        '55555555-5555-5555-5555-555555555555',
        '33333333-3333-3333-3333-333333333333',
        'c3333333-3333-3333-3333-333333333333',
        'ซื้อของใช้เข้าบ้านที่โลตัสพระราม 4',
        'ซื้อของใช้จำเป็น ข้าวสาร นม น้ำยาทำความสะอาด',
        'ซอยสุขุมวิท 22',
        'โลตัส พระราม 4',
        '2026-09-15',
        '10:00:00',
        2.0,
        440.00,
        'completed'
    ),
    (
        'b4444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '44444444-4444-4444-4444-444444444444',
        'd4444444-4444-4444-4444-444444444444',
        'พาเดินออกกำลังกายและเดินทางด้วย BTS',
        'ต้องการคนนำทางขึ้นรถไฟฟ้าและพาไปสวนจตุจักร',
        'คอนโดลุมพินี ลาดพร้าว',
        'สวนจตุจักร กรุงเทพฯ',
        '2026-09-10',
        '07:30:00',
        2.0,
        400.00,
        'completed'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;

-- 6. เพิ่มข้อมูลรีวิว (reviews) สำหรับผู้ร่วมเดินทางทุกคน
INSERT INTO public.reviews (
    id, booking_id, customer_id, companion_id, rating, comment, created_at
)
VALUES 
    (
        '11111111-2222-3333-4444-555555555551',
        'b1111111-1111-1111-1111-111111111111',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        5,
        'ครูปรียามืออาชีพมาก รู้จักทางในโรงพยาบาลเป็นอย่างดี พาไปตรวจตามคิวไม่มีสะดุด คุณแม่ประทับใจมากค่ะ',
        '2026-09-18T12:30:00Z'
    ),
    (
        '11111111-2222-3333-4444-555555555552',
        'b2222222-2222-2222-2222-222222222222',
        '55555555-5555-5555-5555-555555555555',
        '22222222-2222-2222-2222-222222222222',
        5,
        'พี่กรขับรถสุภาพมาก ช่วยพาไปติดต่อสำนักงานเขตและธนาคารอย่างคล่องแคล่ว สะอาด ปลอดภัย แนะนำเลยครับ',
        '2026-09-17T16:00:00Z'
    ),
    (
        '11111111-2222-3333-4444-555555555553',
        'b3333333-3333-3333-3333-333333333333',
        '55555555-5555-5555-5555-555555555555',
        '33333333-3333-3333-3333-333333333333',
        5,
        'คุณนภาดูแลดีมากๆ ค่ะ ตรงต่อเวลา ช่วยเลือกซื้อของและถือของขึ้นห้องให้อย่างสุภาพ แนะนำเลยค่ะ!',
        '2026-09-15T13:00:00Z'
    ),
    (
        '11111111-2222-3333-4444-555555555554',
        'b4444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '44444444-4444-4444-4444-444444444444',
        5,
        'คุณวรวิทย์สุภาพ ตรงเวลา ชวนคุยสนุก ช่วยพาขึ้น BTS ได้อย่างสะดวกสบายและปลอดภัยครับ',
        '2026-09-10T10:30:00Z'
    )
ON CONFLICT (id) DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment;
