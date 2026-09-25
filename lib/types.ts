export type UserRole = 'customer' | 'companion' | 'admin';

export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type MobilityLevel = 'independent' | 'needs_cane' | 'wheelchair' | 'bedridden' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  age?: number;
  gender?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface CompanionProfile {
  id: string;
  bio: string;
  experience_years: number;
  skills: string[];
  service_areas: string[];
  hourly_rate: number;
  is_verified: boolean;
  verification_doc_url?: string;
  id_card_url?: string;
  driver_license_url?: string;
  is_available: boolean;
  rating_avg: number;
  rating_count: number;
  updated_at?: string;
  profile?: Profile;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  companion_id?: string | null;
  service_category_id?: string | null;
  title: string;
  description?: string;
  origin_location: string;
  destination_location: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_hours: number;
  estimated_cost: number;
  special_notes?: string;
  // Customer & Passenger Care Information
  customer_phone?: string;
  is_for_other?: boolean;
  passenger_name?: string;
  passenger_age?: number;
  passenger_gender?: string;
  mobility_level?: MobilityLevel;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
  status: BookingStatus;
  created_at: string;
  updated_at?: string;
  customer?: Profile;
  companion?: CompanionProfile;
  service_category?: ServiceCategory;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  companion_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: Profile;
}
