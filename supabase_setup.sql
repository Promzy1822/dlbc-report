-- ============================================================
-- DLBC Bini Region Weekly Reports — Supabase Setup
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- 1. Create the weekly_reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district TEXT NOT NULL,
  week_no TEXT NOT NULL,
  report_date DATE NOT NULL,
  group_name TEXT DEFAULT '',

  -- HCF
  hcf_count INTEGER DEFAULT 0,
  hcf_present INTEGER DEFAULT 0,
  hcf_new_comers INTEGER DEFAULT 0,

  -- Sunday Worship
  worship_adult_men INTEGER DEFAULT 0,
  worship_adult_women INTEGER DEFAULT 0,
  worship_youth_boys INTEGER DEFAULT 0,
  worship_youth_girls INTEGER DEFAULT 0,
  worship_children_boys INTEGER DEFAULT 0,
  worship_children_girls INTEGER DEFAULT 0,

  -- Bible Study
  bs_adult_men INTEGER DEFAULT 0,
  bs_adult_women INTEGER DEFAULT 0,
  bs_youth_boys INTEGER DEFAULT 0,
  bs_youth_girls INTEGER DEFAULT 0,
  bs_children_boys INTEGER DEFAULT 0,
  bs_children_girls INTEGER DEFAULT 0,

  -- Revival/Evangelism
  rev_adult_men INTEGER DEFAULT 0,
  rev_adult_women INTEGER DEFAULT 0,
  rev_youth_boys INTEGER DEFAULT 0,
  rev_youth_girls INTEGER DEFAULT 0,
  rev_children_boys INTEGER DEFAULT 0,
  rev_children_girls INTEGER DEFAULT 0,

  -- Offerings
  tithes_offering INTEGER DEFAULT 0,
  special_offering INTEGER DEFAULT 0,

  -- Metadata
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique: one report per district per week
  UNIQUE(district, week_no)
);

-- 2. Enable Row Level Security
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Authenticated users can read all reports
CREATE POLICY "Authenticated users can read all reports"
  ON weekly_reports FOR SELECT
  TO authenticated
  USING (true);

-- 4. Policy: Users can insert/update their own district's report
--    (district reps can only write their own district)
--    (admins can write any district — handled via app logic)
CREATE POLICY "Users can insert reports"
  ON weekly_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update reports"
  ON weekly_reports FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- USER SETUP INSTRUCTIONS
-- After running this SQL, create users in Supabase Auth:
-- Go to Authentication → Users → Add User
--
-- Create 6 users total:
--
-- 1. Group Pastor (admin):
--    Email: pastor@dlbc-bini.org (or any email)
--    Password: (set a strong password)
--    User metadata: { "role": "admin", "district": "" }
--
-- 2. OWOSENI District Rep:
--    Email: owoseni@dlbc-bini.org
--    Password: (set password)
--    User metadata: { "role": "district", "district": "OWOSENI" }
--
-- 3. IHOGBE District Rep:
--    Email: ihogbe@dlbc-bini.org
--    Password: (set password)
--    User metadata: { "role": "district", "district": "IHOGBE" }
--
-- 4. IBIWE District Rep:
--    Email: ibiwe@dlbc-bini.org
--    Password: (set password)
--    User metadata: { "role": "district", "district": "IBIWE" }
--
-- 5. OROEGHENE District Rep:
--    Email: oroeghene@dlbc-bini.org
--    Password: (set password)
--    User metadata: { "role": "district", "district": "OROEGHENE" }
--
-- 6. MERCY District Rep:
--    Email: mercy@dlbc-bini.org
--    Password: (set password)
--    User metadata: { "role": "district", "district": "MERCY" }
--
-- To set user metadata in Supabase:
--   Go to Authentication → Users → click the user → Edit
--   In "Raw User Meta Data" paste the JSON above
-- ============================================================
