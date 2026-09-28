-- GoTrip AI Initial Production Database Schema Migration
-- Migration File: 001_gotrip_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. REUSABLE UPDATED_AT TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. PUBLIC CATALOG TABLES
-- ==========================================

-- Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  base_flight NUMERIC,
  avg_hotel NUMERIC,
  image TEXT,
  experiences JSONB,
  best_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attractions Table
CREATE TABLE IF NOT EXISTS attractions (
  id TEXT PRIMARY KEY,
  city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  rating NUMERIC,
  price TEXT,
  price_value NUMERIC,
  image TEXT,
  gallery JSONB,
  description TEXT,
  hours TEXT,
  address TEXT,
  website TEXT,
  map_uri TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attractions_city_id ON attractions(city_id);

-- Accommodations Table
CREATE TABLE IF NOT EXISTS accommodations (
  id TEXT PRIMARY KEY,
  city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  rating NUMERIC,
  price TEXT,
  price_value NUMERIC,
  price_per_night NUMERIC,
  image TEXT,
  website TEXT,
  address TEXT,
  amenities JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accommodations_city_id ON accommodations(city_id);

-- Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine TEXT,
  rating NUMERIC,
  price TEXT,
  price_value NUMERIC,
  image TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city_id ON restaurants(city_id);

-- ==========================================
-- 3. USER & PROTECTED TABLES
-- ==========================================

-- Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  country TEXT,
  currency TEXT,
  language TEXT,
  age TEXT,
  gender TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  dates TEXT,
  travelers INTEGER,
  total_estimated_cost NUMERIC,
  highlights JSONB,
  status TEXT DEFAULT 'saved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);

CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trip Itineraries Table
CREATE TABLE IF NOT EXISTS trip_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  date TEXT,
  title TEXT,
  activities JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_trip_day UNIQUE (trip_id, day)
);

CREATE INDEX IF NOT EXISTS idx_trip_itineraries_trip_id ON trip_itineraries(trip_id);

-- Trip Flights Table
CREATE TABLE IF NOT EXISTS trip_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  flight_option_id TEXT,
  direction TEXT,
  airline TEXT,
  flight_number TEXT,
  departure_time TEXT,
  arrival_time TEXT,
  duration TEXT,
  price NUMERIC,
  logo TEXT,
  origin TEXT,
  destination TEXT,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_flights_trip_id ON trip_flights(trip_id);

-- User Wishlist Table
CREATE TABLE IF NOT EXISTS user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attraction_id TEXT NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_attraction UNIQUE (user_id, attraction_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON user_wishlist(user_id);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT,
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4.1 PUBLIC CATALOG POLICIES (Read-only for all)
CREATE POLICY "Public cities read access"
  ON cities FOR SELECT
  USING (true);

CREATE POLICY "Public attractions read access"
  ON attractions FOR SELECT
  USING (true);

CREATE POLICY "Public accommodations read access"
  ON accommodations FOR SELECT
  USING (true);

CREATE POLICY "Public restaurants read access"
  ON restaurants FOR SELECT
  USING (true);

-- 4.2 PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4.3 TRIPS POLICIES
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);

-- 4.4 TRIP ITINERARIES POLICIES
CREATE POLICY "Users can view itineraries of own trips"
  ON trip_itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert itineraries for own trips"
  ON trip_itineraries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update itineraries of own trips"
  ON trip_itineraries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete itineraries of own trips"
  ON trip_itineraries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_itineraries.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 4.5 TRIP FLIGHTS POLICIES
CREATE POLICY "Users can view flights of own trips"
  ON trip_flights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_flights.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flights for own trips"
  ON trip_flights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_flights.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update flights of own trips"
  ON trip_flights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_flights.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete flights of own trips"
  ON trip_flights FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_flights.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- 4.6 WISHLIST POLICIES
CREATE POLICY "Users can view own wishlist"
  ON user_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own wishlist"
  ON user_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist"
  ON user_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- 4.7 NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
