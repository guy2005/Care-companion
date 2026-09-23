'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, CompanionProfile, ServiceCategory, Booking, Review, UserRole, BookingStatus } from '@/lib/types';
import { INITIAL_CATEGORIES, INITIAL_PROFILES, INITIAL_COMPANIONS, INITIAL_BOOKINGS, INITIAL_REVIEWS } from '@/lib/mockData';
import { createClient } from '@/lib/supabase/client';

interface AppContextType {
  currentUser: Profile | null;
  currentCompanionProfile: CompanionProfile | null;
  role: UserRole;
  isConfiguredWithSupabase: boolean;
  categories: ServiceCategory[];
  companions: CompanionProfile[];
  bookings: Booking[];
  reviews: Review[];
  allProfiles: Profile[];
  loginAsDemo: (role: UserRole) => void;
  switchRole: (role: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createBooking: (newBooking: Omit<Booking, 'id' | 'created_at' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  acceptBooking: (bookingId: string, companionId: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<void>;
  toggleCompanionVerification: (companionId: string) => Promise<void>;
  updateCompanionProfile: (companionId: string, data: Partial<CompanionProfile>, phone?: string) => Promise<void>;
  updateUserProfile: (data: Partial<Profile>) => Promise<void>;
  toggleCompanionAvailability: (companionId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isUuid = (id?: string | null) =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>(INITIAL_CATEGORIES);
  const [companions, setCompanions] = useState<CompanionProfile[]>(INITIAL_COMPANIONS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [allProfiles, setAllProfiles] = useState<Profile[]>(Object.values(INITIAL_PROFILES));
  const [isConfiguredWithSupabase, setIsConfiguredWithSupabase] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  // Central function to fetch all live data from Supabase
  const fetchSupabaseData = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      // 1. Fetch categories
      const { data: catData, error: catErr } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');
      if (!catErr && catData && catData.length > 0) {
        setCategories(catData as ServiceCategory[]);
      }

      // 2. Fetch profiles
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!profErr && profData) {
        const typedProfs = profData as Profile[];
        setAllProfiles(typedProfs);
        setCurrentUser((prev) => {
          if (!prev) return null;
          const fresh = typedProfs.find((p) => p.id === prev.id);
          if (fresh) {
            return {
              ...prev,
              phone: fresh.phone !== undefined ? fresh.phone : prev.phone,
              full_name: fresh.full_name || prev.full_name,
              avatar_url: fresh.avatar_url || prev.avatar_url,
            };
          }
          return prev;
        });
      }

      // 3. Fetch companion profiles with profile join
      const { data: compData, error: compErr } = await supabase
        .from('companion_profiles')
        .select('*, profile:profiles(*)');
      if (!compErr && compData) {
        const formattedDBComps: CompanionProfile[] = compData.map((c: any) => {
          const joinedProfile = Array.isArray(c.profile) ? c.profile[0] : c.profile;
          const fallbackProfile = profData ? (profData as Profile[]).find((p) => p.id === c.id) : undefined;
          return {
            ...c,
            profile: joinedProfile || fallbackProfile,
            skills: Array.isArray(c.skills) ? c.skills : [],
            service_areas: Array.isArray(c.service_areas) ? c.service_areas : [],
            hourly_rate: Number(c.hourly_rate) || 250,
            experience_years: Number(c.experience_years) || 0,
            rating_avg: Number(c.rating_avg) || 5.0,
            rating_count: Number(c.rating_count) || 0,
          };
        });

        // Merge: Real Supabase companions first, then mock companions that are not in DB
        const realIds = new Set(formattedDBComps.map((c) => c.id));
        const savedVerifications = typeof window !== 'undefined' ? localStorage.getItem('care_companion_mock_verifications') : null;
        let verificationsMap: Record<string, boolean> = {};
        if (savedVerifications) {
          try {
            verificationsMap = JSON.parse(savedVerifications);
          } catch (e) {
            console.warn('Failed to parse mock verifications', e);
          }
        }

        const remainingMocks = INITIAL_COMPANIONS
          .filter((m) => !realIds.has(m.id))
          .map((m) => {
            if (verificationsMap[m.id] !== undefined) {
              return { ...m, is_verified: verificationsMap[m.id] };
            }
            return m;
          });
        setCompanions([...formattedDBComps, ...remainingMocks]);
      }

      // 4. Fetch bookings from Supabase
      const { data: bookData, error: bookErr } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (!bookErr && bookData) {
        const formattedBookings: Booking[] = bookData.map((b: any) => ({
          ...b,
          duration_hours: Number(b.duration_hours) || 2.0,
          estimated_cost: Number(b.estimated_cost) || 500,
        }));

        // Merge: Supabase real bookings first, then initial mock bookings
        const realBookIds = new Set(formattedBookings.map((b) => b.id));
        const remainingMockBooks = INITIAL_BOOKINGS.filter((m) => !realBookIds.has(m.id));
        setBookings([...formattedBookings, ...remainingMockBooks]);
      }

      // 5. Fetch reviews
      const { data: revData, error: revErr } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!revErr && revData) {
        const realRevIds = new Set(revData.map((r: any) => r.id));
        const remainingMockRevs = INITIAL_REVIEWS.filter((m) => !realRevIds.has(m.id));
        setReviews([...(revData as Review[]), ...remainingMockRevs]);
      }
    } catch (err) {
      console.warn('Error fetching Supabase data:', err);
    }
  }, []);

  // Initialize and check Supabase session
  useEffect(() => {
    const supabase = createClient();

    if (supabase) {
      setIsConfiguredWithSupabase(true);

      // Fetch initial database state
      fetchSupabaseData();

      // Check current user session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data: profileData }) => {
              const savedRole = localStorage.getItem('care_companion_active_role') as UserRole | null;
              if (profileData) {
                const userProfile = profileData as Profile;
                if (savedRole && ['customer', 'companion', 'admin'].includes(savedRole)) {
                  userProfile.role = savedRole;
                }
                setCurrentUser(userProfile);
              } else {
                const newProfile: Profile = {
                  id: user.id,
                  email: user.email || '',
                  full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'ผู้ใช้งาน',
                  avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
                  role: savedRole || (user.user_metadata?.role as UserRole) || 'customer',
                  created_at: new Date().toISOString(),
                };
                supabase.from('profiles').insert(newProfile).then(() => {
                  setCurrentUser(newProfile);
                });
              }
              setIsAuthLoaded(true);
            });
        } else {
          // No active Supabase user, check if user chose a demo role
          const savedRole = localStorage.getItem('care_companion_active_role');
          if (savedRole && INITIAL_PROFILES[`user-${savedRole}-1`]) {
            setCurrentUser(INITIAL_PROFILES[`user-${savedRole}-1`]);
          } else {
            // Default demo customer for initial experience
            setCurrentUser(INITIAL_PROFILES['user-customer-1']);
          }
          setIsAuthLoaded(true);
        }
      });

      // Listen to auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const savedRole = localStorage.getItem('care_companion_active_role') as UserRole | null;
            const prof = profile as Profile;
            if (savedRole && ['customer', 'companion', 'admin'].includes(savedRole)) {
              prof.role = savedRole;
            }
            setCurrentUser(prof);
          }
          await fetchSupabaseData();
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('care_companion_active_role');
          await fetchSupabaseData();
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // Fallback without Supabase
      const savedRole = localStorage.getItem('care_companion_active_role');
      if (savedRole && INITIAL_PROFILES[`user-${savedRole}-1`]) {
        setCurrentUser(INITIAL_PROFILES[`user-${savedRole}-1`]);
      } else {
        setCurrentUser(INITIAL_PROFILES['user-customer-1']);
      }
      setIsAuthLoaded(true);
    }
  }, [fetchSupabaseData]);

  const loginAsDemo = (targetRole: UserRole) => {
    let profileKey = 'user-customer-1';
    if (targetRole === 'companion') profileKey = 'user-companion-1';
    if (targetRole === 'admin') profileKey = 'user-admin-1';

    const selectedProfile = INITIAL_PROFILES[profileKey];
    setCurrentUser(selectedProfile);
    localStorage.setItem('care_companion_active_role', targetRole);
  };

  // Instant role switch that supports both logged-in real accounts and demo mode
  const switchRole = async (targetRole: UserRole) => {
    localStorage.setItem('care_companion_active_role', targetRole);

    if (currentUser && isUuid(currentUser.id)) {
      // User is logged into Supabase: Update active role directly on the user
      const updatedUser: Profile = { ...currentUser, role: targetRole };
      setCurrentUser(updatedUser);

      const supabase = createClient();
      if (supabase) {
        try {
          // Sync role to profiles table in Supabase
          await supabase.from('profiles').update({ role: targetRole }).eq('id', currentUser.id);

          // If switching to companion, ensure row exists in companion_profiles
          if (targetRole === 'companion') {
            const existing = companions.find((c) => c.id === currentUser.id);
            await supabase.from('companion_profiles').upsert({
              id: currentUser.id,
              bio: existing?.bio || 'ผู้ช่วยร่วมเดินทางพร้อมให้บริการ',
              experience_years: existing?.experience_years ?? 2,
              skills: existing?.skills || ['เข็นรถเข็นผู้สูงอายุ', 'คุ้นเคยระบบโรงพยาบาล', 'ปฐมพยาบาลเบื้องต้น'],
              service_areas: existing?.service_areas || ['กรุงเทพฯ และปริมณฑล'],
              hourly_rate: existing?.hourly_rate ?? 250,
              is_verified: existing?.is_verified ?? false,
              is_available: existing?.is_available ?? true,
            });
          }
        } catch (e) {
          console.warn('Could not sync role to Supabase profiles', e);
        }
      }
      await fetchSupabaseData();
    } else {
      // Demo mode role switch
      loginAsDemo(targetRole);
    }
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    if (!supabase) {
      alert('ยังไม่ได้ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    });

    if (error) {
      console.error('Google Auth Error:', error.message);
      if (error.message.includes('not enabled')) {
        alert('กรุณาเปิดการใช้งาน Google Provider ในหน้า Supabase Dashboard -> Authentication -> Providers -> Google ก่อนครับ');
      } else {
        alert('Google Auth Error: ' + error.message);
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Supabase ยังไม่ได้กำหนดค่าใน .env.local' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile) setCurrentUser(profile as Profile);
      await fetchSupabaseData();
    }
    return { success: true };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, roleToSet: UserRole) => {
    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Supabase ยังไม่ได้กำหนดค่าใน .env.local' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: roleToSet,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const newProf: Profile = {
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: roleToSet,
        created_at: new Date().toISOString(),
      };
      await supabase.from('profiles').upsert(newProf);
      if (roleToSet === 'companion') {
        await supabase.from('companion_profiles').upsert({
          id: data.user.id,
          bio: 'ผู้ช่วยร่วมเดินทางใหม่',
          experience_years: 1,
          skills: ['ช่วยเหลือการเดินทาง'],
          service_areas: ['กรุงเทพฯ'],
          hourly_rate: 250,
          is_verified: true,
          is_available: true,
        });
      }
      setCurrentUser(newProf);
      await fetchSupabaseData();
    }

    return { success: true };
  };

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error', e);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('care_companion_active_role');
    await fetchSupabaseData();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const createBooking = async (newBookingData: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> => {
    // Prevent hiring oneself
    if (newBookingData.companion_id && (newBookingData.companion_id === newBookingData.customer_id || (currentUser && newBookingData.companion_id === currentUser.id))) {
      throw new Error('ไม่สามารถจ้างตัวเองเป็นผู้ร่วมเดินทางได้ กรุณาเลือกผู้ช่วยท่านอื่น');
    }

    const newBooking: Booking = {
      ...newBookingData,
      id: `book-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase && currentUser && isUuid(currentUser.id)) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            customer_id: currentUser.id,
            companion_id: isUuid(newBookingData.companion_id) ? newBookingData.companion_id : null,
            service_category_id: isUuid(newBookingData.service_category_id) ? newBookingData.service_category_id : null,
            title: newBookingData.title,
            description: newBookingData.description || '',
            origin_location: newBookingData.origin_location,
            destination_location: newBookingData.destination_location,
            scheduled_date: newBookingData.scheduled_date,
            scheduled_time: newBookingData.scheduled_time,
            duration_hours: newBookingData.duration_hours,
            estimated_cost: newBookingData.estimated_cost,
            special_notes: newBookingData.special_notes || '',
            status: 'pending',
          })
          .select()
          .single();

        if (!error && data) {
          newBooking.id = data.id;
        } else if (error) {
          console.error('Supabase booking insert error:', error.message);
        }
      } catch (err) {
        console.warn('Could not insert to Supabase, fallback to local', err);
      }
    }

    setBookings((prev) => [newBooking, ...prev]);
    await fetchSupabaseData();
    return newBooking;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status, updated_at: new Date().toISOString() } : b))
    );

    const supabase = createClient();
    if (supabase && isUuid(bookingId)) {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
      if (error) {
        console.error('Supabase updateBookingStatus error:', error.message);
      }
    }
    await fetchSupabaseData();
  };

  const acceptBooking = async (bookingId: string, companionId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking && (targetBooking.customer_id === companionId || (currentUser && targetBooking.customer_id === currentUser.id))) {
      console.warn('Cannot accept booking where customer is yourself');
      throw new Error('ไม่สามารถตอบรับงานที่ตนเองเป็นผู้ว่าจ้างได้');
    }

    const activeComp = companions.find((c) => c.id === companionId || c.id === currentUser?.id);
    if (activeComp && !activeComp.is_verified) {
      console.warn('Companion is not verified by admin');
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              companion_id: companionId,
              status: 'accepted' as BookingStatus,
              updated_at: new Date().toISOString(),
            }
          : b
      )
    );

    const supabase = createClient();
    if (supabase && isUuid(bookingId)) {
      const targetCompId = isUuid(companionId) ? companionId : (currentUser && isUuid(currentUser.id) ? currentUser.id : null);
      const { error } = await supabase
        .from('bookings')
        .update({ companion_id: targetCompId, status: 'accepted' })
        .eq('id', bookingId);

      if (error) {
        console.error('Supabase acceptBooking error:', error.message);
      }
    }
    await fetchSupabaseData();
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      customer: currentUser || undefined,
    };

    setReviews((prev) => [newReview, ...prev]);

    const supabase = createClient();
    if (supabase && isUuid(reviewData.booking_id) && isUuid(reviewData.customer_id) && isUuid(reviewData.companion_id)) {
      const { error } = await supabase.from('reviews').insert({
        booking_id: reviewData.booking_id,
        customer_id: reviewData.customer_id,
        companion_id: reviewData.companion_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      if (error) {
        console.error('Supabase addReview error:', error.message);
      }
    }
    await fetchSupabaseData();
  };

  const toggleCompanionVerification = async (companionId: string) => {
    const target = companions.find((c) => c.id === companionId);
    const nextVal = target ? !target.is_verified : true;

    setCompanions((prev) =>
      prev.map((c) => (c.id === companionId ? { ...c, is_verified: nextVal } : c))
    );

    // Save override for mock companions in localStorage
    if (!isUuid(companionId) && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('care_companion_mock_verifications');
        const verificationsMap: Record<string, boolean> = saved ? JSON.parse(saved) : {};
        verificationsMap[companionId] = nextVal;
        localStorage.setItem('care_companion_mock_verifications', JSON.stringify(verificationsMap));
      } catch (e) {
        console.warn('Failed to save mock verification', e);
      }
    }

    const supabase = createClient();
    if (supabase && isUuid(companionId)) {
      const { error } = await supabase
        .from('companion_profiles')
        .update({ is_verified: nextVal })
        .eq('id', companionId);
      if (error) {
        console.error('Supabase toggleCompanionVerification error:', error.message);
      }
    }
    await fetchSupabaseData();
  };

  const updateCompanionProfile = async (
    companionId: string,
    data: Partial<CompanionProfile>,
    phone?: string
  ) => {
    const existingComp = companions.find((c) => c.id === companionId);

    setCompanions((prev) =>
      prev.map((c) => {
        if (c.id === companionId) {
          const updatedProfile = c.profile
            ? { ...c.profile, ...(phone !== undefined ? { phone } : {}) }
            : c.profile;
          return {
            ...c,
            ...data,
            profile: updatedProfile,
            updated_at: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    if (phone !== undefined) {
      setCurrentUser((prev) => (prev && prev.id === companionId ? { ...prev, phone } : prev));
      setAllProfiles((prev) =>
        prev.map((p) => (p.id === companionId ? { ...p, phone, updated_at: new Date().toISOString() } : p))
      );
    }

    const supabase = createClient();
    if (supabase && isUuid(companionId)) {
      const isVerifiedVal =
        data.is_verified !== undefined
          ? data.is_verified
          : existingComp
          ? existingComp.is_verified
          : false;
      const isAvailableVal =
        data.is_available !== undefined
          ? data.is_available
          : existingComp
          ? existingComp.is_available
          : true;

      const { error } = await supabase.from('companion_profiles').upsert({
        id: companionId,
        bio: data.bio ?? (existingComp?.bio || ''),
        experience_years: data.experience_years ?? (existingComp?.experience_years || 0),
        skills: data.skills ?? (existingComp?.skills || []),
        service_areas: data.service_areas ?? (existingComp?.service_areas || []),
        hourly_rate: data.hourly_rate ?? (existingComp?.hourly_rate || 250),
        is_verified: isVerifiedVal,
        is_available: isAvailableVal,
        verification_doc_url: data.verification_doc_url ?? existingComp?.verification_doc_url ?? null,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase updateCompanionProfile error:', error.message);
      }

      if (phone !== undefined) {
        const { error: profErr } = await supabase
          .from('profiles')
          .update({
            phone: phone.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', companionId);
        if (profErr) {
          console.error('Supabase update profile phone error:', profErr.message);
        }
      }
    }
    await fetchSupabaseData();
  };

  const updateUserProfile = async (data: Partial<Profile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updated_at: new Date().toISOString() };
    setCurrentUser(updated);
    setAllProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? { ...p, ...data } : p)));

    const supabase = createClient();
    if (supabase && isUuid(currentUser.id)) {
      const { error } = await supabase
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', currentUser.id);
      if (error) {
        console.error('Supabase updateUserProfile error:', error.message);
      }
    }
    await fetchSupabaseData();
  };

  const toggleCompanionAvailability = async (companionId: string) => {
    const target = companions.find((c) => c.id === companionId);
    const nextVal = target ? !target.is_available : true;

    setCompanions((prev) =>
      prev.map((c) => (c.id === companionId ? { ...c, is_available: nextVal } : c))
    );

    const supabase = createClient();
    if (supabase && isUuid(companionId)) {
      const { error } = await supabase
        .from('companion_profiles')
        .update({ is_available: nextVal })
        .eq('id', companionId);
      if (error) {
        console.error('Supabase toggleCompanionAvailability error:', error.message);
      }
    }
    await fetchSupabaseData();
  };

  // Find companion profile matching current user, or generate default matching profile
  const currentCompanionProfile: CompanionProfile | null = currentUser?.role === 'companion'
    ? companions.find((c) => c.id === currentUser.id) || {
        id: currentUser.id,
        bio: 'ผู้ช่วยร่วมเดินทางพร้อมให้บริการ',
        experience_years: 2,
        skills: ['เข็นรถเข็นผู้สูงอายุ', 'คุ้นเคยระบบโรงพยาบาล', 'ปฐมพยาบาลเบื้องต้น'],
        service_areas: ['กรุงเทพฯ และปริมณฑล'],
        hourly_rate: 250,
        is_verified: false,
        is_available: true,
        rating_avg: 5.0,
        rating_count: 1,
        profile: currentUser,
      }
    : null;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentCompanionProfile,
        role: currentUser?.role || 'customer',
        isConfiguredWithSupabase,
        categories,
        companions,
        bookings,
        reviews,
        allProfiles,
        loginAsDemo,
        switchRole,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        createBooking,
        updateBookingStatus,
        acceptBooking,
        addReview,
        toggleCompanionVerification,
        updateCompanionProfile,
        updateUserProfile,
        toggleCompanionAvailability,
        refreshData: fetchSupabaseData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
