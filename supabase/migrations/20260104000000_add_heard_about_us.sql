-- Add heard_about_us column to profiles table
-- Migration: 20260104_add_heard_about_us_to_profiles

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS heard_about_us TEXT;

COMMENT ON COLUMN profiles.heard_about_us IS 'Tracks how the user heard about JobSpeakPro. Possible values: TikTok, YouTube, Discord, Twitter/X, Facebook, Friend / Referral, School / Teacher, Google Search, Reddit / Forum, Other, skipped';

CREATE INDEX IF NOT EXISTS idx_profiles_heard_about_us 
ON profiles(heard_about_us);
