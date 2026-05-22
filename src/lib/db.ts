import { createClient } from '@supabase/supabase-js';
import { Job, Certification, Application, UserProfile } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determine if we should use Supabase or fallback to LocalStorage
export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl !== 'your_supabase_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initial Seeds
const DEFAULT_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-hipaa',
    name: 'HIPAA Certification',
    required_or_optional: 'required',
    estimated_cost: 29.99,
    time_to_complete: '2 Hours (Online)',
    training_link: 'https://www.hipaatraining.com/',
    national_or_state_specific: 'National',
    applies_to: ['W-2 Medical Courier', 'Pharmacy Courier', 'Lab Specimen Courier', 'Durable Medical Equipment Delivery Driver'],
    completed: false,
    notes: 'Standard privacy training required for handling patient medical records, specimen charts, and prescription labels.'
  },
  {
    id: 'cert-bbp',
    name: 'OSHA Bloodborne Pathogens (BBP)',
    required_or_optional: 'required',
    estimated_cost: 19.99,
    time_to_complete: '1 Hour (Online)',
    training_link: 'https://www.redcross.org/take-a-class/osha-bloodborne-pathogens',
    national_or_state_specific: 'National',
    applies_to: ['W-2 Medical Courier', 'Lab Specimen Courier'],
    completed: false,
    notes: 'Mandatory OSHA certification for transporting biological fluids, diagnostic lab specimens, and infectious materials.'
  },
  {
    id: 'cert-tsa',
    name: 'TSA Security Threat Assessment (STA)',
    required_or_optional: 'optional',
    estimated_cost: 49.00,
    time_to_complete: '2-3 Weeks (Processing)',
    training_link: 'https://www.tsa.gov/for-industry/security-threat-assessment',
    national_or_state_specific: 'National',
    applies_to: ['DHL Courier', 'Local Courier Company Route'],
    completed: false,
    notes: 'Required to transport cargo onto airport runways or pick up direct air shipments from Baltimore/Washington Airport (BWI).'
  },
  {
    id: 'cert-dot',
    name: 'DOT Medical Examiner Certificate (DOT Physical)',
    required_or_optional: 'required',
    estimated_cost: 85.00,
    time_to_complete: '1 Day (Clinic Exam)',
    training_link: 'https://www.fmcsa.dot.gov/medical/driver-medical-requirements/driver-medical-fitness-requirements',
    national_or_state_specific: 'National',
    applies_to: ['Non-CDL Box Truck Route Driver', 'FedEx Contractor Driver', 'Durable Medical Equipment Delivery Driver'],
    completed: false,
    notes: 'Required for driving commercial motor vehicles over 10,000 lbs (such as medium and large box trucks or heavy dualsprinters).'
  }
];

const DEFAULT_JOBS: Job[] = [
  {
    id: 'job-1',
    job_title: 'W-2 Medical Courier',
    company_name: 'Mid-Atlantic Specimen Transport',
    location: 'Baltimore, MD (ZIP 21237)',
    distance_from_21237: 2.5,
    application_link: 'https://www.indeed.com/jobs?q=medical+courier&l=Baltimore+MD+21237',
    pay_min: 18.50,
    pay_max: 22.50,
    pay_type: 'hourly',
    job_type: 'full_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 8,
    stability_score: 9,
    income_potential_score: 5,
    quick_apply_score: 7,
    certification_difficulty_score: 3,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Standard corporate fleet policy coverage provided by employer.',
    experience_requirements: 'Clean driving record for 3+ years. No prior logistics experience required.',
    required_certifications: ['HIPAA Certification', 'OSHA Bloodborne Pathogens (BBP)'],
    notes: 'Transport specimen kits, blood cards, and slides from clinical hubs to testing centers in Baltimore. Extremely stable hours, company-provided Prius, and gas card included.',
    status: 'saved'
  },
  {
    id: 'job-2',
    job_title: 'Pharmacy Courier',
    company_name: 'Long-Term Care Pharmacy Services',
    location: 'Columbia, MD',
    distance_from_21237: 22.1,
    application_link: 'https://www.indeed.com/jobs?q=pharmacy+courier&l=Columbia+MD',
    pay_min: 20.00,
    pay_max: 24.00,
    pay_type: 'hourly',
    job_type: 'contract',
    vehicle_type: 'own_vehicle',
    cdl_required: false,
    beginner_friendly_score: 7,
    stability_score: 8,
    income_potential_score: 6,
    quick_apply_score: 6,
    certification_difficulty_score: 2,
    background_check_required: true,
    drug_test_required: false,
    mvr_check_required: true,
    insurance_requirements: '100k/300k auto liability coverage.',
    experience_requirements: 'Own reliable, fuel-efficient sedan or crossover. Clean background.',
    required_certifications: ['HIPAA Certification'],
    notes: 'Consistent daily route delivering prescription orders to senior homes and nursing facilities. Pay is structured hourly but requires using your own vehicle. Excellent mileage write-off opportunity.',
    status: 'saved'
  },
  {
    id: 'job-3',
    job_title: 'Lab Specimen Courier',
    company_name: 'Regional Specimen Logistics',
    location: 'Towson, MD',
    distance_from_21237: 12.8,
    application_link: 'https://www.indeed.com/jobs?q=lab+specimen+courier&l=Towson+MD',
    pay_min: 19.00,
    pay_max: 23.00,
    pay_type: 'hourly',
    job_type: 'part_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 8,
    stability_score: 9,
    income_potential_score: 5,
    quick_apply_score: 7,
    certification_difficulty_score: 3,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Employer covered.',
    experience_requirements: 'No courier experience necessary. Outgoing, polite personality is a plus.',
    required_certifications: ['HIPAA Certification', 'OSHA Bloodborne Pathogens (BBP)'],
    notes: 'Evening and weekend shifts transporting medical lab vials. Clean, quiet work using a company hybrid car. Perfect for stacking with a daytime delivery role.',
    status: 'saved'
  },
  {
    id: 'job-4',
    job_title: 'Amazon DSP Driver',
    company_name: 'Apex Courier Logistics',
    location: 'Hanover, MD (Near BWI)',
    distance_from_21237: 17.5,
    application_link: 'https://hiring.amazon.com/',
    pay_min: 20.50,
    pay_max: 22.00,
    pay_type: 'hourly',
    job_type: 'full_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 9,
    stability_score: 8,
    income_potential_score: 6,
    quick_apply_score: 8,
    certification_difficulty_score: 2,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Full employer-provided insurance coverage.',
    experience_requirements: 'Willingness to lift up to 50 lbs. 21+ years of age.',
    required_certifications: [],
    notes: 'Deliver Amazon packages in local Baltimore neighborhoods. Company van, smartphone, and uniform provided. Constant hiring and fast application turnaround (interview in 48 hours).',
    status: 'saved'
  },
  {
    id: 'job-5',
    job_title: 'FedEx Contractor Driver',
    company_name: 'Baltimore Ground Delivery LLC',
    location: 'Halethorpe, MD',
    distance_from_21237: 15.2,
    application_link: 'https://careers.fedex.com/',
    pay_min: 160.00,
    pay_max: 200.00,
    pay_type: 'daily',
    job_type: 'full_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 6,
    stability_score: 7,
    income_potential_score: 7,
    quick_apply_score: 7,
    certification_difficulty_score: 3,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Employer covered.',
    experience_requirements: 'Clean medical card (DOT physical). Box truck or cargo van experience preferred.',
    required_certifications: ['DOT Medical Examiner Certificate (DOT Physical)'],
    notes: 'Consistent daily schedules. Drive step vans or small box trucks on assigned commercial and residential routes. Weekly pay. Requires a clean health certificate (DOT physical).',
    status: 'saved'
  },
  {
    id: 'job-6',
    job_title: 'UPS Package Delivery Driver',
    company_name: 'United Parcel Service (UPS)',
    location: 'Baltimore Downtown Hub',
    distance_from_21237: 8.4,
    application_link: 'https://www.jobs-ups.com/',
    pay_min: 23.00,
    pay_max: 42.00,
    pay_type: 'hourly',
    job_type: 'full_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 4,
    stability_score: 10,
    income_potential_score: 9,
    quick_apply_score: 5,
    certification_difficulty_score: 4,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Elite W-2 benefits and employer insurance.',
    experience_requirements: 'Typically starts with loading shifts, but peak season drivers are hired directly. Strong physical stamina.',
    required_certifications: [],
    notes: 'The gold standard of delivery. High starting pay, top-tier health/pension benefits, W-2 stability. Very physically demanding; strict performance metrics and uniform standards.',
    status: 'saved'
  },
  {
    id: 'job-7',
    job_title: 'DHL Courier',
    company_name: 'DHL Express Regional',
    location: 'Glen Burnie, MD',
    distance_from_21237: 16.3,
    application_link: 'https://careers.dhl.com/',
    pay_min: 21.50,
    pay_max: 25.50,
    pay_type: 'hourly',
    job_type: 'full_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 7,
    stability_score: 9,
    income_potential_score: 7,
    quick_apply_score: 6,
    certification_difficulty_score: 3,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Corporate policy covers all fleet drivers.',
    experience_requirements: 'Clean record. Ability to complete training and secure TSA/STA airport clearances.',
    required_certifications: ['TSA Security Threat Assessment (STA)'],
    notes: 'Deliver express international mail and logistics. Stable shifts, professional organization. Highly regulated - requires background clearance for airport cargo pickups at BWI.',
    status: 'saved'
  },
  {
    id: 'job-8',
    job_title: 'OnTrac Delivery Driver',
    company_name: 'Mid-Atlantic Parcel Express',
    location: 'Elkridge, MD',
    distance_from_21237: 19.8,
    application_link: 'https://ontrac.com/provide-delivery-services/',
    pay_min: 800.00,
    pay_max: 1200.00,
    pay_type: 'weekly',
    job_type: '1099',
    vehicle_type: 'sprinter_van',
    cdl_required: false,
    beginner_friendly_score: 5,
    stability_score: 6,
    income_potential_score: 8,
    quick_apply_score: 6,
    certification_difficulty_score: 3,
    background_check_required: true,
    drug_test_required: false,
    mvr_check_required: true,
    insurance_requirements: 'Commercial auto insurance policy ($1M general liability).',
    experience_requirements: 'Must own or lease a Cargo/Sprinter van. Prior independent route experience is beneficial.',
    required_certifications: ['TSA Security Threat Assessment (STA)'],
    notes: 'Dedicated courier route. 1099 contract paying per week. You must supply your own cargo van/sprinter. Higher revenue potential, but fuel and vehicle maintenance must be factored in.',
    status: 'saved'
  },
  {
    id: 'job-9',
    job_title: 'Auto Parts Delivery Driver',
    company_name: 'National Auto Parts Distributors',
    location: 'Rosedale, MD',
    distance_from_21237: 1.1,
    application_link: 'https://advanceauto.wd5.myworkdayjobs.com/AdvanceExternalCareers/',
    pay_min: 15.00,
    pay_max: 16.50,
    pay_type: 'hourly',
    job_type: 'part_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 10,
    stability_score: 8,
    income_potential_score: 3,
    quick_apply_score: 9,
    certification_difficulty_score: 1,
    background_check_required: true,
    drug_test_required: false,
    mvr_check_required: true,
    insurance_requirements: 'Corporate policy covers all fleet drivers.',
    experience_requirements: 'None! Perfect beginner-friendly job. Simply need a valid license and clean MVR.',
    required_certifications: [],
    notes: 'Extremely easy, stress-free route work. Deliver mufflers, batteries, and tires to local auto repair garages using the shop’s Nissan Versa. Low stress, but lower pay.',
    status: 'saved'
  },
  {
    id: 'job-10',
    job_title: 'Local Courier Company Route',
    company_name: 'Charm City Courier & Messenger',
    location: 'Baltimore Downtown',
    distance_from_21237: 6.8,
    application_link: 'https://www.indeed.com/jobs?q=local+courier+messenger&l=Baltimore+MD',
    pay_min: 180.00,
    pay_max: 250.00,
    pay_type: 'daily',
    job_type: '1099',
    vehicle_type: 'own_vehicle',
    cdl_required: false,
    beginner_friendly_score: 7,
    stability_score: 7,
    income_potential_score: 7,
    quick_apply_score: 7,
    certification_difficulty_score: 2,
    background_check_required: true,
    drug_test_required: false,
    mvr_check_required: true,
    insurance_requirements: '100k/300k private auto coverage with business rider.',
    experience_requirements: 'Strong navigation skills and a reliable hatchback, sedan, or crossover.',
    required_certifications: [],
    notes: 'Local on-demand messenger service. Consistent day-time standby routes delivering legal files, architecture blueprints, and office materials. Paid commissions on standard routes.',
    status: 'saved'
  },
  {
    id: 'job-11',
    job_title: 'Durable Medical Equipment Delivery Driver',
    company_name: 'Compassionate Medical Logistics',
    location: 'Linthicum, MD',
    distance_from_21237: 17.1,
    application_link: 'https://www.indeed.com/jobs?q=DME+delivery+driver&l=Linthicum+MD',
    pay_min: 21.00,
    pay_max: 26.00,
    pay_type: 'hourly',
    job_type: 'full_time',
    vehicle_type: 'company_vehicle',
    cdl_required: false,
    beginner_friendly_score: 6,
    stability_score: 9,
    income_potential_score: 7,
    quick_apply_score: 6,
    certification_difficulty_score: 3,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Employer covered.',
    experience_requirements: 'Clean medical card (DOT physical). Ability to lift/set up oxygen tanks, hospital beds, and wheelchairs.',
    required_certifications: ['HIPAA Certification', 'DOT Medical Examiner Certificate (DOT Physical)'],
    notes: 'Deliver and assemble medical equipment (DME) in home-care settings. High stability and job satisfaction. Excellent pathway to healthcare logistics without a nursing degree.',
    status: 'saved'
  },
  {
    id: 'job-12',
    job_title: 'Non-CDL Box Truck Route Driver',
    company_name: 'Baltimore Office & Industrial Supply',
    location: 'Laurel, MD',
    distance_from_21237: 25.8,
    application_link: 'https://www.indeed.com/jobs?q=box+truck+driver+non+CDL&l=Laurel+MD',
    pay_min: 22.00,
    pay_max: 27.00,
    pay_type: 'hourly',
    job_type: 'full_time',
    vehicle_type: 'box_truck',
    cdl_required: false,
    beginner_friendly_score: 5,
    stability_score: 9,
    income_potential_score: 8,
    quick_apply_score: 5,
    certification_difficulty_score: 3,
    background_check_required: true,
    drug_test_required: true,
    mvr_check_required: true,
    insurance_requirements: 'Commercial fleet policy coverage covered by employer.',
    experience_requirements: 'Clean medical card (DOT physical). Experience operating a 16-to-26 foot box truck with liftgate.',
    required_certifications: ['DOT Medical Examiner Certificate (DOT Physical)'],
    notes: 'Establish consistent W-2 route driving commercial box trucks delivering wholesale supplies, office furniture, or packaging boxes. Great work-life balance (Monday-Friday, 6:00 AM start).',
    status: 'saved'
  }
];

// Fallback Helper Functions (LocalStorage)
const getLocalStorageData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setLocalStorageData = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};

// Unified Database API
export const db = {
  // Jobs
  async getJobs(): Promise<Job[]> {
    if (supabase) {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Job[];
      console.warn('Supabase getJobs failed, falling back to LocalStorage', error);
    }
    return getLocalStorageData<Job[]>('cc_jobs', DEFAULT_JOBS);
  },

  async getJobById(id: string): Promise<Job | null> {
    if (supabase) {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (!error && data) return data as Job;
      console.warn('Supabase getJobById failed, falling back to LocalStorage', error);
    }
    const jobs = getLocalStorageData<Job[]>('cc_jobs', DEFAULT_JOBS);
    return jobs.find(j => j.id === id) || null;
  },

  async addJob(job: Omit<Job, 'id'>): Promise<Job> {
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`
    };

    if (supabase) {
      const { data, error } = await supabase.from('jobs').insert([job]).select().single();
      if (!error && data) return data as Job;
      console.warn('Supabase addJob failed, falling back to LocalStorage', error);
    }

    const jobs = getLocalStorageData<Job[]>('cc_jobs', DEFAULT_JOBS);
    jobs.push(newJob);
    setLocalStorageData('cc_jobs', jobs);
    return newJob;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    if (supabase) {
      const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single();
      if (!error && data) return data as Job;
      console.warn('Supabase updateJob failed, falling back to LocalStorage', error);
    }

    const jobs = getLocalStorageData<Job[]>('cc_jobs', DEFAULT_JOBS);
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Job not found');
    const updatedJob = { ...jobs[index], ...updates };
    jobs[index] = updatedJob;
    setLocalStorageData('cc_jobs', jobs);
    return updatedJob;
  },

  async deleteJob(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (!error) return;
      console.warn('Supabase deleteJob failed, falling back to LocalStorage', error);
    }

    const jobs = getLocalStorageData<Job[]>('cc_jobs', DEFAULT_JOBS);
    const filteredJobs = jobs.filter(j => j.id !== id);
    setLocalStorageData('cc_jobs', filteredJobs);
  },

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    if (supabase) {
      const { data, error } = await supabase.from('certifications').select('*').order('created_at', { ascending: true });
      if (!error && data) return data as Certification[];
      console.warn('Supabase getCertifications failed, falling back to LocalStorage', error);
    }
    return getLocalStorageData<Certification[]>('cc_certifications', DEFAULT_CERTIFICATIONS);
  },

  async updateCertification(id: string, updates: Partial<Certification>): Promise<Certification> {
    if (supabase) {
      const { data, error } = await supabase.from('certifications').update(updates).eq('id', id).select().single();
      if (!error && data) return data as Certification;
      console.warn('Supabase updateCertification failed, falling back to LocalStorage', error);
    }

    const certs = getLocalStorageData<Certification[]>('cc_certifications', DEFAULT_CERTIFICATIONS);
    const index = certs.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Certification not found');
    const updatedCert = { ...certs[index], ...updates };
    certs[index] = updatedCert;
    setLocalStorageData('cc_certifications', certs);
    return updatedCert;
  },

  // Applications
  async getApplications(): Promise<Application[]> {
    if (supabase) {
      const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Application[];
      console.warn('Supabase getApplications failed, falling back to LocalStorage', error);
    }
    return getLocalStorageData<Application[]>('cc_applications', []);
  },

  async addApplication(application: Omit<Application, 'id'>): Promise<Application> {
    const newApp: Application = {
      ...application,
      id: `app-${Date.now()}`
    };

    if (supabase) {
      const { data, error } = await supabase.from('applications').insert([application]).select().single();
      if (!error && data) return data as Application;
      console.warn('Supabase addApplication failed, falling back to LocalStorage', error);
    }

    const apps = getLocalStorageData<Application[]>('cc_applications', []);
    apps.push(newApp);
    setLocalStorageData('cc_applications', apps);

    // Sync with corresponding Job status
    await this.updateJob(application.job_id, { status: application.status });

    return newApp;
  },

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    if (supabase) {
      const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select().single();
      if (!error && data) return data as Application;
      console.warn('Supabase updateApplication failed, falling back to LocalStorage', error);
    }

    const apps = getLocalStorageData<Application[]>('cc_applications', []);
    const index = apps.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    const updatedApp = { ...apps[index], ...updates };
    apps[index] = updatedApp;
    setLocalStorageData('cc_applications', apps);

    // If application status changed, sync with corresponding Job
    if (updates.status) {
      await this.updateJob(updatedApp.job_id, { status: updates.status });
    }

    return updatedApp;
  },

  async deleteApplication(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (!error) return;
      console.warn('Supabase deleteApplication failed, falling back to LocalStorage', error);
    }

    const apps = getLocalStorageData<Application[]>('cc_applications', []);
    const filteredApps = apps.filter(a => a.id !== id);
    setLocalStorageData('cc_applications', filteredApps);
  },

  // User Profile
  async getProfile(): Promise<UserProfile | null> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (!error && data) return data as UserProfile;
      console.warn('Supabase getProfile failed, falling back to LocalStorage', error);
    }
    const defaultProfile: UserProfile = {
      id: 'user-profile',
      full_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      summary: '',
      years_driving: 0,
      has_clean_mvr: true,
      has_own_vehicle: false,
      vehicle_description: '',
      certifications_held: [],
      skills: [],
      work_history: [],
      education: []
    };
    return getLocalStorageData<UserProfile>('cc_profile', defaultProfile);
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').upsert([profile]).select().single();
      if (!error && data) return data as UserProfile;
      console.warn('Supabase saveProfile failed, falling back to LocalStorage', error);
    }
    setLocalStorageData('cc_profile', profile);
    return profile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile();
    const updatedProfile = { ...profile, ...updates } as UserProfile;
    if (supabase) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', profile?.id || 'user-profile').select().single();
      if (!error && data) return data as UserProfile;
      console.warn('Supabase updateProfile failed, falling back to LocalStorage', error);
    }
    setLocalStorageData('cc_profile', updatedProfile);
    return updatedProfile;
  },

  // Reset database back to default seed data
  async resetToSeeds(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_jobs', JSON.stringify(DEFAULT_JOBS));
      localStorage.setItem('cc_certifications', JSON.stringify(DEFAULT_CERTIFICATIONS));
      localStorage.setItem('cc_applications', JSON.stringify([]));
      localStorage.removeItem('cc_profile');
    }
  }
};
