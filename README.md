# DLBC Bini Region — Weekly Report System

A web app for Deeper Life Bible Church (Bini Region) to replace the manual paper-based weekly group summary report. Each district enters their own data, and the Group Pastor can view and print the aggregated report in the original template format.

---

## Features

- **5 district accounts**: OWOSENI, IHOGBE, IBIWE, OROEGHENE, MERCY
- **Admin/Pastor account**: sees all districts, summary dashboard, and print view
- **Auto-calculated totals**: subtotals update as you type
- **Print-ready template**: matches the original paper form exactly
- **Week history**: select and compare any previous week's data
- **Live submission status**: green dots show which districts have submitted

---

## Step-by-Step Deployment Guide

### Step 1 — Create a Supabase account (free)

1. Go to **https://supabase.com** and sign up for free
2. Click **"New Project"**
3. Enter project name: `dlbc-bini-reports`
4. Choose a strong database password (save it!)
5. Select region: **West US (or EU West)** — closest to Nigeria
6. Click **"Create new project"** and wait ~2 minutes

### Step 2 — Set up the database

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase_setup.sql` from this project folder
4. Copy the entire contents and paste into the SQL editor
5. Click **"Run"** (the green button)
6. You should see "Success. No rows returned"

### Step 3 — Get your Supabase credentials

1. In Supabase, go to **Settings → API** (in the left sidebar)
2. Copy two values:
   - **Project URL** (looks like: `https://abcdefghij.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 4 — Configure the app

1. In the project folder, find the file `.env.example`
2. Copy it and rename the copy to `.env.local`
3. Open `.env.local` and replace the placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key...
```

### Step 5 — Create user accounts

In Supabase, go to **Authentication → Users → Add User** and create 6 users:

| Name | Email | Password | Role (metadata) | District (metadata) |
|------|-------|----------|-----------------|---------------------|
| Group Pastor | pastor@yourdomain.com | (strong pw) | `admin` | *(leave blank)* |
| OWOSENI Rep | owoseni@yourdomain.com | (pw) | `district` | `OWOSENI` |
| IHOGBE Rep | ihogbe@yourdomain.com | (pw) | `district` | `IHOGBE` |
| IBIWE Rep | ibiwe@yourdomain.com | (pw) | `district` | `IBIWE` |
| OROEGHENE Rep | oroeghene@yourdomain.com | (pw) | `district` | `OROEGHENE` |
| MERCY Rep | mercy@yourdomain.com | (pw) | `district` | `MERCY` |

**To add metadata to each user:**
1. Click the user in the list
2. Scroll to **"Raw User Meta Data"**
3. Enter: `{ "role": "district", "district": "OWOSENI" }` (adjust per user)
4. For the pastor: `{ "role": "admin", "district": "" }`
5. Click Save

### Step 6 — Deploy to Vercel (free hosting)

1. Go to **https://github.com** and create a free account if you don't have one
2. Create a new repository called `dlbc-weekly-report`
3. Upload all the project files to the repository

**OR use Vercel CLI (easier):**
```bash
npm install -g vercel
cd dlbc-report
vercel login
vercel
```

When Vercel asks for environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key

4. Vercel will give you a URL like `https://dlbc-weekly-report.vercel.app`
5. Share this URL with all district reps and the group pastor

### Step 7 — Run locally (for testing)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## How to use the app

### For District Representatives (OWOSENI, IHOGBE, etc.)

1. Open the app URL in any browser (phone or computer)
2. Log in with your district email and password
3. Click **"Enter This Week's Data"**
4. Fill in all the fields (totals calculate automatically)
5. Click **"Save Report"** — you're done!

### For the Group Pastor (Admin)

1. Log in with your admin email and password
2. Dashboard shows real-time submission status from all districts
3. Click **"Group Summary"** to see full breakdown
4. Click **"Print Report"** to get the printable template
5. Select any previous week from the dropdown to view past data

---

## Project Structure

```
src/
  app/
    page.tsx          — Redirect to login or dashboard
    login/page.tsx    — Login screen
    dashboard/page.tsx — Home after login
    entry/page.tsx    — Data entry form
    summary/page.tsx  — Group summary table
    print/page.tsx    — Print-ready template
  components/
    Sidebar.tsx       — Navigation sidebar
    Toast.tsx         — Notification system
  lib/
    supabase.ts       — Database client
    types.ts          — Districts, report types, calculations
```

---

## Tech Stack

- **Next.js 14** (React framework)
- **TypeScript** (type safety)
- **Supabase** (database + authentication, free tier)
- **Vercel** (hosting, free tier)

---

## Support

Contact your developer if you need help with setup. Once deployed, no further technical knowledge is needed to use the app.
