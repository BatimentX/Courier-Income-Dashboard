export type PayType = 'hourly' | 'daily' | 'weekly' | 'per_route' | 'per_delivery' | 'salary';

export type JobType = 'full_time' | 'part_time' | 'contract' | 'seasonal' | '1099' | 'w2';

export type VehicleType = 'own_vehicle' | 'company_vehicle' | 'cargo_van' | 'sprinter_van' | 'box_truck' | 'car' | 'suv' | 'unknown';

export type JobStatus = 'saved' | 'applied' | 'interview' | 'onboarding' | 'rejected' | 'accepted';

export interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  distance_from_21237: number; // in miles
  application_link?: string;
  pay_min: number;
  pay_max: number;
  pay_type: PayType;
  job_type: JobType;
  vehicle_type: VehicleType;
  cdl_required: boolean;
  beginner_friendly_score: number; // 1-10
  stability_score: number; // 1-10
  income_potential_score: number; // 1-10
  quick_apply_score: number; // 1-10
  certification_difficulty_score: number; // 1-10
  background_check_required: boolean;
  drug_test_required: boolean;
  mvr_check_required: boolean;
  insurance_requirements?: string;
  experience_requirements?: string;
  required_certifications: string[];
  notes?: string;
  status: JobStatus;
  created_at?: string;
}

export interface Certification {
  id: string;
  name: string;
  required_or_optional: 'required' | 'optional';
  estimated_cost: number;
  time_to_complete: string;
  training_link?: string;
  national_or_state_specific: string;
  applies_to: string[]; // List of jobs/categories this applies to
  completed: boolean;
  completion_date?: string;
  notes?: string;
}

export interface Application {
  id: string;
  job_id: string;
  date_applied: string;
  follow_up_date?: string;
  status: JobStatus;
  notes?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface ExpenseCalculation {
  fuelCost: number;
  maintenanceCost: number;
  insuranceCost: number;
  taxReserve: number;
  totalExpenses: number;
}

export interface IncomeCalculationResult {
  grossWeekly: number;
  expensesWeekly: number;
  taxWeekly: number;
  netWeekly: number;
  netMonthly: number;
  effectiveHourly: number;
}

export interface ComboRecommendation {
  id: string;
  name: string;
  jobs: Job[];
  estimatedWeeklyIncome: number;
  estimatedMonthlyIncome: number;
  estimatedHours: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  stabilityLevel: 'Low' | 'Medium' | 'High';
  vehicleWearLevel: 'None' | 'Low' | 'Medium' | 'High';
  whyItWorks: string;
  whyItMayNotWork: string;
  bestScheduleFit: string;
  recommendationRating: number; // 1-10
}
