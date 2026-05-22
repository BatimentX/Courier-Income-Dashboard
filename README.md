# Courier Income Decision Dashboard 🚚💼

The **Courier Income Decision Dashboard** is a highly polished, mobile-first Next.js web application built to evaluate, optimize, and stack non-CDL courier, delivery driver, and route opportunities near **Baltimore, MD / ZIP 21237** (within a 20 to 40-mile radius of **8800 Hunting Ln, Laurel, MD 20708**).

It is specifically designed for drivers seeking **W-2 employment stability, consistent 1099 commercial routes, and vehicle-fleet opportunities**, while strictly **excluding common app-based gig delivery systems** (such as DoorDash, Uber, Uber Eats, Lyft, Amazon Flex, Walmart Spark, Roadie, Grubhub, Veho, Jitsu Drive, Instacart, and Gopuff).

---

## 🌟 Key Application Features

1. **Dashboard Overview**: Summary widgets tracking average compatibility scores, weekly revenues, road distances, and active application statuses. Includes interactive charts comparing weekly gross earnings vs. net profits after vehicle expenses and tax reserves.
2. **Job Comparison Matrix**: Powered by TanStack Table, allowing quick searches, responsive column sorting, and custom multi-attribute filtering (W-2 vs. 1099, company car vs. own van, CDL license exclusions).
3. **Interactive Net Income Calculator**: Sliders for custom mileage, average fuel prices, vehicle MPG, routine maintenance estimates, commercial auto insurance, and self-employment taxes. Select any of the pre-loaded jobs to instantly load their parameters!
4. **Schedule Combo Optimizer**: Algorithmic suggestion matrix suggesting 2-job and 3-job combinations (e.g., Full-time W-2 day shift + part-time evening/weekend specimen routes) with calculated gross/net weekly income, mileage risks, and vehicle wear-and-tear meters.
5. **Certification & Compliance Tracker**: Dynamic dashboard monitoring HIPAA, OSHA Bloodborne Pathogens (BBP), TSA Security clearances (STA), and DOT physical cards.
6. **7-to-14 Day Action Plan**: Interactive day-by-day checklist customized for Baltimore couriers. Highlights a **$49 Fast Pass** (HIPAA + OSHA BBP online combo) to immediately unlock 4 high-paying medical specimen driver roles!
7. **Application Tracker & Pipelines**: Kanban-style status channels (Saved, Applied, Interview, Onboarding, Accepted, Rejected) with built-in diaries for manager contact logs.

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (inline theme definitions, modern glassmorphic panels, dynamic gradient effects)
- **Database Engine**: Dual-Mode Database Layer (`src/lib/db.ts`)
  - **Development Mode**: Standard client-side `localStorage` cache. Pre-seeded with 12 highly detailed, local Maryland courier roles and 4 compliance certificates. No database setup needed to start developing!
  - **Production Mode**: Seamlessly switches to standard Supabase Postgres operations when keys are declared in environmental files.
- **Table Components**: `@tanstack/react-table` (v8)
- **Visual Charts**: `Recharts` (v3)

---

## 🗄️ Database & Schema Setup (Supabase)

The project includes PostgreSQL schema tables prepared to execute directly in the Supabase SQL Editor.

### Step 1: Execute Table Definitions
Copy the SQL commands inside [`supabase/schema.sql`](file:///c:/Users/Batiment/Documents/Courier%20Services%20Antigravity/supabase/schema.sql) and run them in your Supabase SQL Editor:
- Creates `jobs`, `certifications`, and `applications` tables.
- Establishes cascading foreign key connections between jobs and active pipelines.
- Configures secure indexing.

### Step 2: Seed the Database
To populate your live Supabase DB, you can call the custom database seeder `db.resetToSeeds()` through the dashboard reset settings or let it run automatically on its first connection.

---

## 🚀 Running the Project Locally

### 1. Installation
Clone or navigate to the repository directory and install NPM packages:
```bash
npm install
```

### 2. Run the Development Server
Launch the compiler and boot up the localized dev client:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your mobile responsive browser.

### 3. Build & Typecheck (Next.js Turbopack)
To compile static pages, bundles, and run full TypeScript diagnostics:
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

The application is configured to deploy directly to Vercel.

### Required Environmental Variables
During Vercel project configuration, set up the following keys to connect with your live Supabase database instance:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project API URL | `https://xyzabc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project Public Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

*If these variables are omitted, the app will gracefully fall back to full **LocalStorage Dual-Mode**, persisting all data changes locally inside the user's browser cache.*

---

## 📐 Recommendation Engine Scoring Formula

The dashboard recommendations are computed out of 100 points based on the following custom weights:
- **Stability (25%)**: `stability_score` (1-10) $\times$ 2.5
- **Pay Potential (20%)**: `income_potential_score` (1-10) $\times$ 2.0
- **Non-CDL Fit (15%)**: 15 points if CDL is *not* required, else 0
- **Own-Vehicle Fit (10%)**: 10 points if own-vehicle compatible, else 0
- **Company Vehicle Bonus (10%)**: 10 points if company vehicle provided (no wear-and-tear), else 0
- **Beginner-Friendly (10%)**: `beginner_friendly_score` (1-10) $\times$ 1.0
- **Quick Apply (5%)**: `quick_apply_score` (1-10) $\times$ 0.5
- **Low Certification Difficulty (5%)**: $(11 - \text{certification\_difficulty\_score}) \times 0.5$

*Normalization Formula*: To allow either vehicle category (own-vehicle vs. company-vehicle) to achieve a perfect 100-point compatibility match despite their mutual exclusivity, raw scores are normalized by a $1.1111$ factor ($100 / 90$ raw points max) and capped at 100.
