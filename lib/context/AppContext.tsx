'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  loginAsDemo: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createBooking: (newBooking: Omit<Booking, 'id' | 'created_at' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  acceptBooking: (bookingId: string, companionId: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'created_at'>) => Promise<void>;
  toggleCompanionVerification: (companionId: string) => Promise<void>;
  updateCompanionProfile: (companionId: string, data: Partial<CompanionProfile>) => Promise<void>;
  toggleCompanionAvailability: (companionId: string) => Promise<void>;
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
  const [isConfiguredWithSupabase, setIsConfiguredWithSupabase] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  // Initialize and check Supabase session
  useEffect(() => {
    const supabase = createClient();

    if (supabase) {
      setIsConfiguredWithSupabase(true);

      // 1. Fetch categories from Supabase
      supabase
        .from('service_categories')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setCategories(data as ServiceCategory[]);
          }
        });

      // 2. Fetch real user session from Supabase
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data: profileData }) => {
              if (profileData) {
                setCurrentUser(profileData as Profile);
              } else {
                // User logged in via Google but trigger didn't fire or profile not created yet
                const newProfile: Profile = {
                  id: user.id,
                  email: user.email || '',
                  full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'ผู้ใช้งาน',
                  avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
                  role: (user.user_metadata?.role as UserRole) || 'customer',
                  created_at: new Date().toISOString(),
                };
                supabase.from('profiles').insert(newProfile).then(() => {
                  setCurrentUser(newProfile);
                });
              }
              setIsAuthLoaded(true);
            });
        } else {
          // If no active Supabase user, check if user chose a demo role
          const savedRole = localStorage.getItem('care_companion_active_role');
          if (savedRole && INITIAL_PROFILES[`user-${savedRole}-1`]) {
            setCurrentUser(INITIAL_PROFILES[`user-${savedRole}-1`]);
          }
          setIsAuthLoaded(true);
        }
      });

      // 3. Listen to auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser(profile as Profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('care_companion_active_role');
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
        // Default to demo customer for seamless first view if not set
        setCurrentUser(INITIAL_PROFILES['user-customer-1']);
      }
      setIsAuthLoaded(true);
    }

    // Load persisted local data
    const savedBookings = localStorage.getItem('care_companion_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    }

    const savedCompanions = localStorage.getItem('care_companion_companions');
    if (savedCompanions) {
      try {
        setCompanions(JSON.parse(savedCompanions));
      } catch (e) {
        console.error('Failed to parse saved companions', e);
      }
    }

    const savedReviews = localStorage.getItem('care_companion_reviews');
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error('Failed to parse saved reviews', e);
      }
    }
  }, []);

  const saveBookingsToStorage = (updated: Booking[]) => {
    setBookings(updated);
    localStorage.setItem('care_companion_bookings', JSON.stringify(updated));
  };

  const saveCompanionsToStorage = (updated: CompanionProfile[]) => {
    setCompanions(updated);
    localStorage.setItem('care_companion_companions', JSON.stringify(updated));
  };

  const saveReviewsToStorage = (updated: Review[]) => {
    setReviews(updated);
    localStorage.setItem('care_companion_reviews', JSON.stringify(updated));
  };

  const loginAsDemo = (targetRole: UserRole) => {
    let profileKey = 'user-customer-1';
    if (targetRole === 'companion') profileKey = 'user-companion-1';
    if (targetRole === 'admin') profileKey = 'user-admin-1';

    const selectedProfile = INITIAL_PROFILES[profileKey];
    setCurrentUser(selectedProfile);
    localStorage.setItem('care_companion_active_role', targetRole);
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
      setCurrentUser(newProf);
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
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const createBooking = async (newBookingData: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> => {
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
          console.warn('Supabase booking insert error:', error.message);
        }
      } catch (err) {
        console.warn('Could not insert to Supabase, fallback to local', err);
      }
    }

    const updated = [newBooking, ...bookings];
    saveBookingsToStorage(updated);
    return newBooking;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status, updated_at: new Date().toISOString() } : b));
    saveBookingsToStorage(updated);

    const supabase = createClient();
    if (supabase && isUuid(bookingId)) {
      await supabase.from('bookings').update({ status }).eq('id', bookingId);
    }
  };

  const acceptBooking = async (bookingId: string, companionId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            companion_id: companionId,
            status: 'accepted' as BookingStatus,
            updated_at: new Date().toISOString(),
          }
        : b
    );
    saveBookingsToStorage(updated);

    const supabase = createClient();
    if (supabase && isUuid(bookingId) && isUuid(companionId)) {
      await supabase
        .from('bookings')
        .update({ companion_id: companionId, status: 'accepted' })
        .eq('id', bookingId);
    }
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      customer: currentUser || undefined,
    };

    const updatedReviews = [newReview, ...reviews];
    saveReviewsToStorage(updatedReviews);

    // Recalculate companion rating
    const targetCompanionReviews = updatedReviews.filter((r) => r.companion_id === reviewData.companion_id);
    const avg = targetCompanionReviews.reduce((sum, r) => sum + r.rating, 0) / targetCompanionReviews.length;
    const count = targetCompanionReviews.length;

    const updatedCompanions = companions.map((c) =>
      c.id === reviewData.companion_id
        ? {
            ...c,
            rating_avg: parseFloat(avg.toFixed(2)),
            rating_count: count,
          }
        : c
    );
    saveCompanionsToStorage(updatedCompanions);

    const supabase = createClient();
    if (supabase && isUuid(reviewData.booking_id) && isUuid(reviewData.customer_id) && isUuid(reviewData.companion_id)) {
      await supabase.from('reviews').insert({
        booking_id: reviewData.booking_id,
        customer_id: reviewData.customer_id,
        companion_id: reviewData.companion_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
    }
  };

  const toggleCompanionVerification = async (companionId: string) => {
    const updatedCompanions = companions.map((c) =>
      c.id === companionId ? { ...c, is_verified: !c.is_verified } : c
    );
    saveCompanionsToStorage(updatedCompanions);

    const supabase = createClient();
    if (supabase && isUuid(companionId)) {
      const target = updatedCompanions.find((c) => c.id === companionId);
      if (target) {
        await supabase
          .from('companion_profiles')
          .update({ is_verified: target.is_verified })
          .eq('id', companionId);
      }
    }
  };

  const updateCompanionProfile = async (companionId: string, data: Partial<CompanionProfile>) => {
    const updated = companions.map((c) => (c.id === companionId ? { ...c, ...data } : c));
    saveCompanionsToStorage(updated);

    const supabase = createClient();
    if (supabase && isUuid(companionId)) {
      await supabase.from('companion_profiles').update(data).eq('id', companionId);
    }
  };

  const toggleCompanionAvailability = async (companionId: string) => {
    const updated = companions.map((c) =>
      c.id === companionId ? { ...c, is_available: !c.is_available } : c
    );
    saveCompanionsToStorage(updated);

    const supabase = createClient();
    if (supabase && isUuid(companionId)) {
      const target = updated.find((c) => c.id === companionId);
      if (target) {
        await supabase
          .from('companion_profiles')
          .update({ is_available: target.is_available })
          .eq('id', companionId);
      }
    }
  };

  const currentCompanionProfile = currentUser?.role === 'companion'
    ? companions.find((c) => c.id === currentUser.id) || null
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
        loginAsDemo,
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
        toggleCompanionAvailability,
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
