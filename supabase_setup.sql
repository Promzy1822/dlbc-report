-- ============================================================
-- DLBC Bini Region Weekly Reports — Supabase Setup
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Drop table if exists (fresh start)
DROP TABLE IF EXISTS weekly_reports;

-- 2. Create the weekly_reports table
CREATE TABLE weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district TEXT NOT NULL,
  week_no TEXT NOT NULL,
  report_date DATE NOT NULL,
  group_name TEXT DEFAULT '',

  -- HCF
  hcf_count INTEGER DEFAULT 0,
  hcf_present INTEGER DEFAULT 0,
  hcf_new_comers INTEGER DEFAULT 0,

  -- Sunday Worship Attendance
  worship_adult_men INTEGER DEFAULT 0,
  worship_adult_women INTEGER DEFAULT 0,
  worship_youth_boys INTEGER DEFAULT 0,
  worship_youth_girls INTEGER DEFAULT 0,
  worship_children_boys INTEGER DEFAULT 0,
  worship_children_girls INTEGER DEFAULT 0,
  worship_offering INTEGER DEFAULT 0,

  -- Bible Study Attendance
  bs_adult_men INTEGER DEFAULT 0,
  bs_adult_women INTEGER DEFAULT 0,
  bs_youth_boys INTEGER DEFAULT 0,
  bs_youth_girls INTEGER DEFAULT 0,
  bs_children_boys INTEGER DEFAULT 0,
  bs_children_girls INTEGER DEFAULT 0,
  bs_offering INTEGER DEFAULT 0,

  -- Revival/Evangelism Attendance
  rev_adult_men INTEGER DEFAULT 0,
  rev_adult_women INTEGER DEFAULT 0,
  rev_youth_boys INTEGER DEFAULT 0,
  rev_youth_girls INTEGER DEFAULT 0,
  rev_children_boys INTEGER DEFAULT 0,
  rev_children_girls INTEGER DEFAULT 0,
  rev_offering INTEGER DEFAULT 0,

  -- Special one-time offering
  special_offering INTEGER DEFAULT 0,

  -- Metadata
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- One report per district per week
  UNIQUE(district, week_no)
);

-- 3. Enable Row Level Security
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Read all reports"
  ON weekly_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Insert reports"
  ON weekly_reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Update reports"
  ON weekly_reports FOR UPDATE TO authenticated USING (true);
