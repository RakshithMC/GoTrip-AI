-- GoTrip AI User Preferences Schema Migration
-- Migration File: 004_user_preferences.sql

-- 1. Create public.user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interests JSONB NOT NULL DEFAULT '{}'::jsonb,
  disliked_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  travel_style TEXT NOT NULL DEFAULT 'Balanced',
  activity_preferences JSONB NOT NULL DEFAULT '[]'::jsonb,
  budget_min NUMERIC NOT NULL DEFAULT 10000,
  budget_max NUMERIC NOT NULL DEFAULT 50000,
  preferred_transport TEXT NOT NULL DEFAULT 'Transit',
  trip_pace TEXT NOT NULL DEFAULT 'Moderate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on user_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Updated_at trigger binding
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);
