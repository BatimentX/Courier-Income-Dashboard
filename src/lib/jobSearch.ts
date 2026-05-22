import { Job, JobType, VehicleType, PayType, JobStatus } from '../types';

export interface DiscoverJobSearchOptions {
  query: string;
  location?: string;
  radius?: number;
  page?: number;
}

const CACHE_KEY = 'discover_jobs_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

interface CachedData {
  timestamp: number;
  results: Job[];
}

export function getRapidApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('cc_rapidapi_key') || '';
}

export function saveRapidApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cc_rapidapi_key', key);
}

// Maps JSearch response items to our unified Job schema
export function mapApiJobToInternalJob(apiJob: any): Job {
  const title = apiJob.job_title || 'Courier/Delivery Driver';
  const company = apiJob.job_publisher || apiJob.employer_name || 'Independent Contractor';
  const location = `${apiJob.job_city || 'Baltimore'}, ${apiJob.job_state || 'MD'}`;
  const jobDescription = (apiJob.job_description || '').toLowerCase();
  
  // Parse pay
  let payMin = 18.00;
  let payMax = 23.00;
  let payType: PayType = 'hourly';
  
  if (apiJob.job_min_salary) payMin = Number(apiJob.job_min_salary);
  if (apiJob.job_max_salary) payMax = Number(apiJob.job_max_salary);
  if (apiJob.job_salary_period) {
    const period = apiJob.job_salary_period.toLowerCase();
    if (period === 'hour' || period === 'hourly') payType = 'hourly';
    else if (period === 'day' || period === 'daily') payType = 'daily';
    else if (period === 'week' || period === 'weekly') payType = 'weekly';
    else if (period === 'year' || period === 'yearly') payType = 'salary';
  } else {
    // Attempt to extract hourly rate from description if salary fields are empty
    const payRegex = /\$(\d{2})(?:\.\d{2})?\s*-\s*\$(\d{2})(?:\.\d{2})?\s*\/?[hH]our/;
    const match = jobDescription.match(payRegex);
    if (match) {
      payMin = Number(match[1]);
      payMax = Number(match[2]);
    }
  }

  // Handle high numbers for daily/weekly in case API period is wrong
  if (payMin > 100 && payMin < 1000 && payType === 'hourly') {
    payType = 'daily';
  } else if (payMin >= 1000 && payType === 'hourly') {
    payType = 'salary';
  }

  // Deduce Job Type
  let jobType: JobType = 'w2';
  if (apiJob.job_employment_type) {
    const et = apiJob.job_employment_type.toLowerCase();
    if (et.includes('full') || et.includes('fulltime')) jobType = 'full_time';
    else if (et.includes('part') || et.includes('parttime')) jobType = 'part_time';
    else if (et.includes('contract') || et.includes('contractor') || et.includes('1099')) jobType = '1099';
  }
  
  if (jobDescription.includes('1099') || jobDescription.includes('independent contractor')) {
    jobType = '1099';
  }

  // Deduce Vehicle Type
  let vehicleType: VehicleType = 'company_vehicle';
  if (jobDescription.includes('own vehicle') || jobDescription.includes('personal vehicle') || jobDescription.includes('use your own car')) {
    vehicleType = 'own_vehicle';
  } else if (jobDescription.includes('sprinter') || jobDescription.includes('sprinter van')) {
    vehicleType = 'sprinter_van';
  } else if (jobDescription.includes('cargo van')) {
    vehicleType = 'cargo_van';
  } else if (jobDescription.includes('box truck')) {
    vehicleType = 'box_truck';
  } else if (jobDescription.includes('company provided') || jobDescription.includes('company van') || jobDescription.includes('company car') || jobDescription.includes('fleet vehicle')) {
    vehicleType = 'company_vehicle';
  }

  // Deduce requirements
  const cdlRequired = jobDescription.includes('cdl a') || jobDescription.includes('cdl b') || jobDescription.includes('commercial drivers license');
  const backgroundCheck = jobDescription.includes('background check') || jobDescription.includes('criminal history') || !jobDescription.includes('no background check');
  const drugTest = jobDescription.includes('drug test') || jobDescription.includes('drug screen') || jobDescription.includes('substance screen');
  const mvrCheck = jobDescription.includes('mvr') || jobDescription.includes('driving record') || jobDescription.includes('motor vehicle record');

  // Estimate Scores based on keywords (Heuristic Engine)
  let stability = 7;
  let beginner = 8;
  let quickApply = 7;
  let certDiff = 2;
  let incomePotential = 5;

  if (jobType === 'full_time' || jobType === 'w2') stability = 8;
  if (jobType === '1099') stability = 5;

  // Medical/Specimen checks
  const isMedical = jobDescription.includes('medical') || jobDescription.includes('specimen') || jobDescription.includes('blood') || jobDescription.includes('lab') || title.toLowerCase().includes('medical');
  const isPharmacy = jobDescription.includes('pharmacy') || jobDescription.includes('prescription') || jobDescription.includes('medication');
  const isAmazon = company.toLowerCase().includes('amazon') || title.toLowerCase().includes('dsp') || jobDescription.includes('amazon dsp');
  const isFedex = company.toLowerCase().includes('fedex') || jobDescription.includes('fedex ground');
  const isUps = company.toLowerCase().includes('ups') || title.toLowerCase().includes('united parcel service');
  const isAutoParts = jobDescription.includes('auto parts') || jobDescription.includes('napa') || jobDescription.includes('advance auto') || jobDescription.includes('oreilly');

  const requiredCerts: string[] = [];

  if (isMedical) {
    stability = 9;
    certDiff = 3;
    requiredCerts.push('HIPAA Certification');
    if (jobDescription.includes('pathogen') || jobDescription.includes('specimen') || jobDescription.includes('blood')) {
      requiredCerts.push('OSHA Bloodborne Pathogens (BBP)');
    }
  }

  if (isPharmacy) {
    stability = 8;
    certDiff = 2;
    requiredCerts.push('HIPAA Certification');
  }

  if (isAmazon) {
    stability = 8;
    beginner = 9;
    quickApply = 8;
    vehicleType = 'company_vehicle';
  }

  if (isFedex) {
    stability = 7;
    beginner = 6;
    certDiff = 3;
    requiredCerts.push('DOT Medical Examiner Certificate (DOT Physical)');
    vehicleType = 'company_vehicle';
  }

  if (isUps) {
    stability = 10;
    beginner = 4;
    certDiff = 4;
    vehicleType = 'company_vehicle';
  }

  if (isAutoParts) {
    stability = 8;
    beginner = 10;
    quickApply = 9;
    certDiff = 1;
    vehicleType = 'company_vehicle';
    payMin = payMin || 15.00;
    payMax = payMax || 17.00;
  }

  // Adjust income potential score based on pay range
  const avgHourly = payType === 'hourly' ? (payMin + payMax) / 2 : 20;
  if (avgHourly >= 30) incomePotential = 9;
  else if (avgHourly >= 25) incomePotential = 8;
  else if (avgHourly >= 22) incomePotential = 7;
  else if (avgHourly >= 19) incomePotential = 6;
  else if (avgHourly >= 16) incomePotential = 5;
  else incomePotential = 3;

  // Calculate generic distance from Baltimore / 21237
  // Seed a random but realistic number for mock consistency
  let distance = 10;
  if (apiJob.job_city) {
    const city = apiJob.job_city.toLowerCase();
    if (city.includes('baltimore') || city.includes('rosedale')) distance = 3 + Math.floor(Math.random() * 5);
    else if (city.includes('towson') || city.includes('glen burnie')) distance = 10 + Math.floor(Math.random() * 6);
    else if (city.includes('columbia') || city.includes('elkridge') || city.includes('hanover')) distance = 15 + Math.floor(Math.random() * 8);
    else if (city.includes('laurel')) distance = 25 + Math.floor(Math.random() * 6);
    else distance = 12 + Math.floor(Math.random() * 20);
  }

  return {
    id: apiJob.job_id || `api-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    job_title: title,
    company_name: company,
    location,
    distance_from_21237: distance,
    application_link: apiJob.job_apply_link || 'https://www.indeed.com',
    pay_min: payMin,
    pay_max: payMax,
    pay_type: payType,
    job_type: jobType,
    vehicle_type: vehicleType,
    cdl_required: cdlRequired,
    beginner_friendly_score: beginner,
    stability_score: stability,
    income_potential_score: incomePotential,
    quick_apply_score: quickApply,
    certification_difficulty_score: certDiff,
    background_check_required: backgroundCheck,
    drug_test_required: drugTest,
    mvr_check_required: mvrCheck,
    insurance_requirements: vehicleType === 'own_vehicle' || vehicleType === 'sprinter_van' || vehicleType === 'cargo_van'
      ? '100k/300k auto liability policy required.'
      : 'Fleet vehicle insurance fully covered by employer.',
    experience_requirements: isMedical || isFedex || isUps
      ? '1+ years driving or delivery experience preferred. Must be 21+.'
      : 'Clean MVR. Beginners welcome. Will train.',
    required_certifications: requiredCerts,
    notes: apiJob.job_description ? `${apiJob.job_description.substring(0, 200)}...` : 'Real-time courier opportunity imported via JSearch API.',
    status: 'saved'
  };
}

export async function searchJobs(options: DiscoverJobSearchOptions): Promise<Job[]> {
  const apiKey = getRapidApiKey();
  if (!apiKey) {
    console.warn('No JSearch API key configured. Returning fallback mock results.');
    return getMockResults(options.query);
  }

  // Check cache first
  const cacheKey = `${CACHE_KEY}_${options.query}_${options.location || ''}`;
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: CachedData = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          console.log('Returning JSearch results from local cache.');
          return parsed.results;
        }
      }
    } catch (e) {
      console.error('Error reading search cache:', e);
    }
  }

  const query = `${options.query} near ${options.location || 'Laurel, MD 20708'}`;
  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${options.page || 1}&num_pages=1`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.statusText} (${response.status})`);
    }

    const body = await response.json();
    const apiJobs = body.data || [];
    
    // Filter out jobs from undesirable redirect domains (e.g. localjobmatcher.com)
    const mappedJobs = apiJobs
      .map(mapApiJobToInternalJob)
      .filter((job: Job) => {
        if (job.application_link && job.application_link.toLowerCase().includes('localjobmatcher.com')) {
          return false;
        }
        return true;
      });

    // Save to cache
    if (typeof window !== 'undefined') {
      try {
        const cacheData: CachedData = {
          timestamp: Date.now(),
          results: mappedJobs
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        console.error('Error saving search cache:', e);
      }
    }

    return mappedJobs;
  } catch (error) {
    console.error('JSearch API failed. Falling back to high-fidelity mock results.', error);
    return getMockResults(options.query);
  }
}

// High-fidelity fallback/mock engine in case user does not have key
function getMockResults(query: string): Job[] {
  const q = query.toLowerCase();
  
  const allMocks: Job[] = [
    {
      id: 'mock-med-1',
      job_title: 'Medical Courier Route (W-2)',
      company_name: 'Quest Diagnostics',
      location: 'Baltimore, MD 21237',
      distance_from_21237: 2.1,
      application_link: 'https://careers.questdiagnostics.com/',
      pay_min: 19.50,
      pay_max: 23.50,
      pay_type: 'hourly',
      job_type: 'full_time',
      vehicle_type: 'company_vehicle',
      cdl_required: false,
      beginner_friendly_score: 7,
      stability_score: 9,
      income_potential_score: 6,
      quick_apply_score: 6,
      certification_difficulty_score: 3,
      background_check_required: true,
      drug_test_required: true,
      mvr_check_required: true,
      insurance_requirements: 'Corporate fleet policy provided by employer.',
      experience_requirements: 'Clean driving record. 1+ years professional driving preferred.',
      required_certifications: ['HIPAA Certification', 'OSHA Bloodborne Pathogens (BBP)'],
      notes: 'Quest Diagnostics is hiring a full-time W-2 Courier in Baltimore. Transport patient laboratory specimens from physician offices to the central laboratory. Benefits include health, dental, vision, 401(k), and paid time off.',
      status: 'saved'
    },
    {
      id: 'mock-med-2',
      job_title: '1099 Medical Courier / Lab Route',
      company_name: 'USPack Logistics',
      location: 'Glen Burnie, MD',
      distance_from_21237: 15.4,
      application_link: 'https://www.gouspack.com/drive-with-us/',
      pay_min: 220.00,
      pay_max: 310.00,
      pay_type: 'daily',
      job_type: '1099',
      vehicle_type: 'own_vehicle',
      cdl_required: false,
      beginner_friendly_score: 6,
      stability_score: 7,
      income_potential_score: 8,
      quick_apply_score: 7,
      certification_difficulty_score: 3,
      background_check_required: true,
      drug_test_required: false,
      mvr_check_required: true,
      insurance_requirements: '100k/300k auto liability with business rider.',
      experience_requirements: 'Must own a clean, fuel-efficient sedan, hatchback, or SUV.',
      required_certifications: ['HIPAA Certification', 'OSHA Bloodborne Pathogens (BBP)'],
      notes: 'Independent contractor delivery route. Perform scheduled courier pick-ups and deliveries for regional laboratory accounts. High earning potential with daily route rates. Fuel is contractor responsibility.',
      status: 'saved'
    },
    {
      id: 'mock-phar-1',
      job_title: 'Pharmacy Specimen Courier',
      company_name: 'Omnicare Pharmacy Services',
      location: 'Columbia, MD',
      distance_from_21237: 21.8,
      application_link: 'https://jobs.cvshealth.com/',
      pay_min: 18.00,
      pay_max: 22.00,
      pay_type: 'hourly',
      job_type: 'part_time',
      vehicle_type: 'company_vehicle',
      cdl_required: false,
      beginner_friendly_score: 8,
      stability_score: 9,
      income_potential_score: 5,
      quick_apply_score: 7,
      certification_difficulty_score: 2,
      background_check_required: true,
      drug_test_required: true,
      mvr_check_required: true,
      required_certifications: ['HIPAA Certification'],
      notes: 'Deliver prescription medications, oncology orders, and infusion sets to nursing homes, assisted living, and group home facilities. Company sedan provided, shift starts Columbia hub.',
      status: 'saved'
    },
    {
      id: 'mock-dsp-1',
      job_title: 'Delivery Driver - Amazon DSP',
      company_name: 'Ascend Logistics Inc',
      location: 'Hanover, MD',
      distance_from_21237: 18.1,
      application_link: 'https://hiring.amazon.com/',
      pay_min: 20.50,
      pay_max: 21.75,
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
      required_certifications: [],
      notes: 'Drive custom branded blue vans delivering packages to home and business locations near BWI and Glen Burnie. 4-day, 10-hour work week. Excellent growth potential, health package, tuition coverage.',
      status: 'saved'
    },
    {
      id: 'mock-fedex-1',
      job_title: 'Route Delivery Driver (FedEx Ground)',
      company_name: 'Overland Logistics LLC',
      location: 'Halethorpe, MD',
      distance_from_21237: 14.9,
      application_link: 'https://careers.fedex.com/',
      pay_min: 175.00,
      pay_max: 210.00,
      pay_type: 'daily',
      job_type: 'full_time',
      vehicle_type: 'company_vehicle',
      cdl_required: false,
      beginner_friendly_score: 6,
      stability_score: 8,
      income_potential_score: 7,
      quick_apply_score: 7,
      certification_difficulty_score: 3,
      background_check_required: true,
      drug_test_required: true,
      mvr_check_required: true,
      required_certifications: ['DOT Medical Examiner Certificate (DOT Physical)'],
      notes: 'FedEx Ground Independent Contractor hiring package delivery route drivers. Requires DOT physical card. Deliver packages in box trucks or cargo vans. 5-day schedules, weekly pay check.',
      status: 'saved'
    },
    {
      id: 'mock-auto-1',
      job_title: 'Store Parts Courier',
      company_name: 'NAPA Auto Parts',
      location: 'Dundalk, MD',
      distance_from_21237: 4.8,
      application_link: 'https://jobs.genpt.com/',
      pay_min: 15.50,
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
      required_certifications: [],
      notes: 'Deliver wholesale auto parts to commercial mechanics and auto body shops. Run simple, consistent routes using the NAPA shop parts truck. Low stress, friendly store team environment.',
      status: 'saved'
    }
  ];

  // Simple filtering
  if (q.includes('med') || q.includes('specimen') || q.includes('clinical')) {
    return allMocks.filter(j => j.id.includes('med'));
  }
  if (q.includes('pharm') || q.includes('drug') || q.includes('prescrip')) {
    return allMocks.filter(j => j.id.includes('phar'));
  }
  if (q.includes('amazon') || q.includes('dsp')) {
    return allMocks.filter(j => j.id.includes('dsp'));
  }
  if (q.includes('fedex') || q.includes('ground') || q.includes('route')) {
    return allMocks.filter(j => j.id.includes('fedex'));
  }
  if (q.includes('auto') || q.includes('napa') || q.includes('parts')) {
    return allMocks.filter(j => j.id.includes('auto'));
  }
  
  return allMocks;
}
