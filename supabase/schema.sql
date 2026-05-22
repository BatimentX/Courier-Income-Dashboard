-- Create Job table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT NOT NULL,
    distance_from_21237 NUMERIC,
    application_link TEXT,
    pay_min NUMERIC NOT NULL,
    pay_max NUMERIC NOT NULL,
    pay_type TEXT CHECK (pay_type IN ('hourly', 'daily', 'weekly', 'per_route', 'per_delivery', 'salary')),
    job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'seasonal', '1099', 'w2')),
    vehicle_type TEXT CHECK (vehicle_type IN ('own_vehicle', 'company_vehicle', 'cargo_van', 'sprinter_van', 'box_truck', 'car', 'suv', 'unknown')),
    cdl_required BOOLEAN DEFAULT false,
    beginner_friendly_score INTEGER CHECK (beginner_friendly_score BETWEEN 1 AND 10),
    stability_score INTEGER CHECK (stability_score BETWEEN 1 AND 10),
    income_potential_score INTEGER CHECK (income_potential_score BETWEEN 1 AND 10),
    quick_apply_score INTEGER CHECK (quick_apply_score BETWEEN 1 AND 10),
    certification_difficulty_score INTEGER CHECK (certification_difficulty_score BETWEEN 1 AND 10),
    background_check_required BOOLEAN DEFAULT false,
    drug_test_required BOOLEAN DEFAULT false,
    mvr_check_required BOOLEAN DEFAULT false,
    insurance_requirements TEXT,
    experience_requirements TEXT,
    required_certifications TEXT[] DEFAULT '{}',
    notes TEXT,
    status TEXT CHECK (status IN ('saved', 'applied', 'interview', 'onboarding', 'rejected', 'accepted')) DEFAULT 'saved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Certification table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    required_or_optional TEXT CHECK (required_or_optional IN ('required', 'optional')),
    estimated_cost NUMERIC DEFAULT 0,
    time_to_complete TEXT,
    training_link TEXT,
    national_or_state_specific TEXT,
    applies_to TEXT[] DEFAULT '{}',
    completed BOOLEAN DEFAULT false,
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Application table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    date_applied DATE DEFAULT CURRENT_DATE,
    follow_up_date DATE,
    status TEXT CHECK (status IN ('saved', 'applied', 'interview', 'onboarding', 'rejected', 'accepted')) DEFAULT 'applied',
    notes TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common searches and queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_pay_type ON jobs(pay_type);
CREATE INDEX IF NOT EXISTS idx_jobs_vehicle_type ON jobs(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
