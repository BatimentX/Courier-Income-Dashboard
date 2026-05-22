import { Job, ComboRecommendation } from '../types';

/**
 * Utility to calculate weekly income for a job based on pay and normal weekly hours/days.
 */
export function getEstimatedWeeklyIncome(job: Job): number {
  const payAvg = (job.pay_min + job.pay_max) / 2;
  
  switch (job.pay_type) {
    case 'hourly':
      // Assume 40 hours for full time, 20 for part time, 30 for contract/other
      const hours = job.job_type === 'full_time' ? 40 : job.job_type === 'part_time' ? 20 : 30;
      return payAvg * hours;
    case 'daily':
      // Assume 5 days for full time, 3 days for part time/contract
      const days = job.job_type === 'full_time' ? 5 : 3;
      return payAvg * days;
    case 'weekly':
      return payAvg;
    case 'per_route':
      // Assume 5 routes per week
      return payAvg * 5;
    case 'per_delivery':
      // Assume 30 deliveries per week
      return payAvg * 30;
    case 'salary':
      return payAvg / 52;
    default:
      return payAvg * 40;
  }
}

/**
 * Utility to estimate hours for a job based on its type.
 */
export function getEstimatedHours(job: Job): number {
  if (job.pay_type === 'hourly') {
    return job.job_type === 'full_time' ? 40 : job.job_type === 'part_time' ? 20 : 30;
  }
  
  switch (job.job_type) {
    case 'full_time':
      return 40;
    case 'part_time':
      return 20;
    case 'contract':
      return 25;
    case 'seasonal':
      return 35;
    default:
      return 30;
  }
}

/**
 * Compile optimized 2-job and 3-job combinations based on the active jobs list.
 */
export function generateCombinations(jobs: Job[]): ComboRecommendation[] {
  if (!jobs || jobs.length === 0) return [];

  const combos: ComboRecommendation[] = [];

  // Helper to find specific seeded jobs or categories
  const findJobByTitleOrCompany = (titleKeyword: string, companyKeyword?: string): Job | null => {
    return jobs.find(j => {
      const matchTitle = j.job_title.toLowerCase().includes(titleKeyword.toLowerCase());
      const matchCompany = companyKeyword 
        ? j.company_name.toLowerCase().includes(companyKeyword.toLowerCase()) 
        : true;
      return matchTitle && matchCompany;
    }) || null;
  };

  // Find job instances
  const w2Medical = findJobByTitleOrCompany('W-2 Medical Courier') || jobs.find(j => j.job_title.includes('Medical') && j.job_type === 'full_time');
  const partTimeLab = findJobByTitleOrCompany('Lab Specimen Courier') || jobs.find(j => j.job_title.includes('Lab') || j.job_title.includes('Specimen'));
  const amazonDsp = findJobByTitleOrCompany('Amazon DSP') || jobs.find(j => j.company_name.includes('Amazon') || j.job_title.includes('DSP'));
  const pharmacy1099 = findJobByTitleOrCompany('Pharmacy Courier') || jobs.find(j => j.job_title.includes('Pharmacy'));
  const fedexContractor = findJobByTitleOrCompany('FedEx') || jobs.find(j => j.company_name.includes('FedEx') || j.job_title.includes('FedEx'));
  const autoParts = findJobByTitleOrCompany('Auto Parts') || jobs.find(j => j.job_title.includes('Auto'));
  const localCourier = findJobByTitleOrCompany('Local Courier') || jobs.find(j => j.job_title.includes('Local') && j.job_type === '1099');
  const nonCdlBox = findJobByTitleOrCompany('Box Truck') || jobs.find(j => j.job_title.includes('Box Truck'));

  // 1. Stable W-2 Courier + Weekend Medical Courier
  if (w2Medical && partTimeLab) {
    const jobA = w2Medical;
    const jobB = partTimeLab;
    const incomeA = getEstimatedWeeklyIncome(jobA);
    const incomeB = getEstimatedWeeklyIncome(jobB);
    const hoursA = getEstimatedHours(jobA);
    const hoursB = getEstimatedHours(jobB);

    combos.push({
      id: 'combo-1',
      name: 'W-2 Full-Time Courier + Weekend Lab Specimen Courier',
      jobs: [jobA, jobB],
      estimatedWeeklyIncome: Math.round(incomeA + incomeB),
      estimatedMonthlyIncome: Math.round((incomeA + incomeB) * 4.33),
      estimatedHours: hoursA + hoursB,
      riskLevel: 'Low',
      stabilityLevel: 'High',
      vehicleWearLevel: 'None', // Both company vehicles!
      whyItWorks: 'Both roles provide stable W-2 income and use company-provided vehicles, meaning zero wear-and-tear on your personal car and zero fuel expenses. The schedules align perfectly: primary day shift Monday-Friday, and part-time evening/weekend lab routes.',
      whyItMayNotWork: 'Working 6 days a week can lead to burnout. Weekend lab specimen courier hours might have strict pick-up windows and low flexibility.',
      bestScheduleFit: 'Mon-Fri: 7:00 AM - 3:30 PM (Medical Courier) + Sat-Sun: 4:00 PM - 10:00 PM (Lab Courier)',
      recommendationRating: 9.5
    });
  }

  // 2. Amazon DSP Driver + Evening Pharmacy Courier
  if (amazonDsp && pharmacy1099) {
    const jobA = amazonDsp;
    const jobB = pharmacy1099;
    const incomeA = getEstimatedWeeklyIncome(jobA);
    const incomeB = getEstimatedWeeklyIncome(jobB);
    const hoursA = getEstimatedHours(jobA);
    const hoursB = getEstimatedHours(jobB);

    combos.push({
      id: 'combo-2',
      name: 'Amazon DSP Driver + Evening Pharmacy Courier Route',
      jobs: [jobA, jobB],
      estimatedWeeklyIncome: Math.round(incomeA + incomeB),
      estimatedMonthlyIncome: Math.round((incomeA + incomeB) * 4.33),
      estimatedHours: hoursA + hoursB,
      riskLevel: 'Medium',
      stabilityLevel: 'High',
      vehicleWearLevel: 'Medium', // Amazon is company vehicle, Pharmacy is own vehicle
      whyItWorks: 'You maximize your daytime earnings using Amazon’s company van, keeping vehicle wear to a minimum. Then, you supplement your income on a consistent evening pharmacy route. The W-2 base from Amazon covers your health benefits and basic expenses.',
      whyItMayNotWork: 'Amazon DSP driving is highly physical and tiring. Adding evening driving on top can cause high fatigue. Pharmacy delivery routes require high compliance and HIPAA accountability.',
      bestScheduleFit: 'Mon-Thu: 9:00 AM - 7:30 PM (Amazon DSP) + Fri-Sat: 6:00 PM - 11:00 PM (Pharmacy Courier)',
      recommendationRating: 8.5
    });
  }

  // 3. FedEx Contractor Route + Part-Time Auto Parts Delivery
  if (fedexContractor && autoParts) {
    const jobA = fedexContractor;
    const jobB = autoParts;
    const incomeA = getEstimatedWeeklyIncome(jobA);
    const incomeB = getEstimatedWeeklyIncome(jobB);
    const hoursA = getEstimatedHours(jobA);
    const hoursB = getEstimatedHours(jobB);

    combos.push({
      id: 'combo-3',
      name: 'FedEx Ground Route + Part-Time Auto Parts Driver',
      jobs: [jobA, jobB],
      estimatedWeeklyIncome: Math.round(incomeA + incomeB),
      estimatedMonthlyIncome: Math.round((incomeA + incomeB) * 4.33),
      estimatedHours: hoursA + hoursB,
      riskLevel: 'Low',
      stabilityLevel: 'High',
      vehicleWearLevel: 'None', // Both company vehicles
      whyItWorks: 'FedEx routes are highly consistent, structured, and fast-paced. Supplementing with auto parts delivery is extremely low stress, beginner-friendly, and utilizes shop hatchbacks. The physical contrast of auto parts is a great breather from heavy FedEx parcels.',
      whyItMayNotWork: 'FedEx contractors often pay daily, so if your route runs late, your effective hourly rate drops. Strict schedule overlap could occur if FedEx deliveries run past 4 PM.',
      bestScheduleFit: 'Mon-Fri: 7:30 AM - 4:00 PM (FedEx Ground) + Sat: 8:00 AM - 4:00 PM (Auto Parts Driver)',
      recommendationRating: 8.0
    });
  }

  // 4. Medical Courier Day Route + Local Courier Evening Route
  if (w2Medical && localCourier) {
    const jobA = w2Medical;
    const jobB = localCourier;
    const incomeA = getEstimatedWeeklyIncome(jobA);
    const incomeB = getEstimatedWeeklyIncome(jobB);
    const hoursA = getEstimatedHours(jobA);
    const hoursB = getEstimatedHours(jobB);

    combos.push({
      id: 'combo-4',
      name: 'Medical Courier Day Route + Local Courier 1099 Standby',
      jobs: [jobA, jobB],
      estimatedWeeklyIncome: Math.round(incomeA + incomeB),
      estimatedMonthlyIncome: Math.round((incomeA + incomeB) * 4.33),
      estimatedHours: hoursA + hoursB,
      riskLevel: 'Medium',
      stabilityLevel: 'Medium',
      vehicleWearLevel: 'Medium', // Medical is company car, local courier is own vehicle
      whyItWorks: 'You spend your daytime hours earning high stability, tax-free fuel W-2 income with a company Prius. During evening standby hours, you accept lucrative local messenger deliveries around downtown Baltimore. Excellent split of employment stability and 1099 tax deductions.',
      whyItMayNotWork: 'Standby evening routes can be highly inconsistent. Baltimore traffic during late afternoon overlap can make dispatch times stressful.',
      bestScheduleFit: 'Mon-Fri: 6:30 AM - 2:30 PM (Medical Courier) + Mon-Wed: 4:00 PM - 8:00 PM (Local Courier Standby)',
      recommendationRating: 8.8
    });
  }

  // Catch-all combo if some seeds were deleted or missing
  if (combos.length === 0 && jobs.length >= 2) {
    const jobA = jobs[0];
    const jobB = jobs[1];
    const incomeA = getEstimatedWeeklyIncome(jobA);
    const incomeB = getEstimatedWeeklyIncome(jobB);
    
    combos.push({
      id: 'combo-fallback',
      name: `Hybrid Route: ${jobA.job_title} + ${jobB.job_title}`,
      jobs: [jobA, jobB],
      estimatedWeeklyIncome: Math.round(incomeA + incomeB),
      estimatedMonthlyIncome: Math.round((incomeA + incomeB) * 4.33),
      estimatedHours: getEstimatedHours(jobA) + getEstimatedHours(jobB),
      riskLevel: 'Medium',
      stabilityLevel: 'Medium',
      vehicleWearLevel: 'Medium',
      whyItWorks: `Combines the pay potential of ${jobA.company_name} with the flexible timing of ${jobB.company_name}.`,
      whyItMayNotWork: 'Requires coordination between two active courier networks and schedule dispatch times.',
      bestScheduleFit: 'Day shift on primary job + Evening/Weekend on secondary job.',
      recommendationRating: 7.0
    });
  }

  return combos;
}
