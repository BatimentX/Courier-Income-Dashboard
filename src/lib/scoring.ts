import { Job } from '../types';

export interface ScoreDetails {
  total: number;
  stability: number;
  pay: number;
  nonCdl: number;
  ownVehicle: number;
  companyVehicle: number;
  beginner: number;
  quickApply: number;
  certDifficulty: number;
}

/**
 * Calculates the compatibility score for a courier job based on the user's custom weightings.
 * Weightings:
 * - Stability: 25% (stability_score * 2.5)
 * - Pay potential: 20% (income_potential_score * 2.0)
 * - Non-CDL fit: 15% (15 points if cdl_required is false, else 0)
 * - Own-vehicle fit: 10% (10 points if own-vehicle compatible, else 0)
 * - Company vehicle bonus: 10% (10 points if company vehicle, else 0)
 * - Beginner friendly: 10% (beginner_friendly_score * 1.0)
 * - Quick apply: 5% (quick_apply_score * 0.5)
 * - Low cert difficulty: 5% ((11 - certification_difficulty_score) * 0.5)
 * 
 * Since own_vehicle and company_vehicle are mutually exclusive in practice,
 * the maximum raw score is 90. We normalize by multiplying by 1.1111 (100 / 90)
 * and capping at 100, so a perfect job in its respective class can reach 100.
 */
export function calculateJobScore(job: Job): ScoreDetails {
  const stability = (job.stability_score || 0) * 2.5; // Max 25
  const pay = (job.income_potential_score || 0) * 2.0; // Max 20
  
  // Non-CDL fit: 15 points if CDL is NOT required, else 0
  const nonCdl = job.cdl_required ? 0 : 15; // Max 15

  // Own-vehicle friendly: own_vehicle, sprinter_van, cargo_van, car, suv
  const isOwnVehicleFriendly = ['own_vehicle', 'car', 'suv', 'sprinter_van', 'cargo_van'].includes(job.vehicle_type);
  const ownVehicle = isOwnVehicleFriendly ? 10 : 0; // Max 10

  // Company-vehicle bonus: 10 points if company vehicle
  const companyVehicle = job.vehicle_type === 'company_vehicle' ? 10 : 0; // Max 10

  const beginner = (job.beginner_friendly_score || 0) * 1.0; // Max 10
  const quickApply = (job.quick_apply_score || 0) * 0.5; // Max 5
  
  // Low certification difficulty: 5 points if score is 1, scales down to 0 points if score is 10
  const certDifficulty = Math.max(0, (11 - (job.certification_difficulty_score || 1))) * 0.5; // Max 5

  const rawTotal = stability + pay + nonCdl + ownVehicle + companyVehicle + beginner + quickApply + certDifficulty;
  
  // Normalize based on 90 max raw points
  const total = Math.min(100, Math.round(rawTotal * (100 / 90)));

  return {
    total,
    stability,
    pay,
    nonCdl,
    ownVehicle,
    companyVehicle,
    beginner,
    quickApply,
    certDifficulty
  };
}

export interface RecommendationSummary {
  bestOverall: Job | null;
  bestStableW2: Job | null;
  bestOwnVehicle: Job | null;
  bestCompanyVehicle: Job | null;
  bestMedicalPharmacy: Job | null;
  bestPackageDelivery: Job | null;
  bestLocalCourier: Job | null;
  jobsToAvoid: Job[];
}

/**
 * Categorizes and picks the best jobs in each category based on compatibility scores.
 */
export function getRecommendations(jobs: Job[]): RecommendationSummary {
  if (!jobs || jobs.length === 0) {
    return {
      bestOverall: null,
      bestStableW2: null,
      bestOwnVehicle: null,
      bestCompanyVehicle: null,
      bestMedicalPharmacy: null,
      bestPackageDelivery: null,
      bestLocalCourier: null,
      jobsToAvoid: []
    };
  }

  // Calculate scores for all jobs
  const jobsWithScores = jobs.map(job => ({
    job,
    score: calculateJobScore(job).total
  }));

  // Helper to get highest scoring job matching a filter
  const getBestMatch = (filterFn: (j: Job) => boolean): Job | null => {
    const matches = jobsWithScores
      .filter(item => filterFn(item.job))
      .sort((a, b) => b.score - a.score);
    return matches.length > 0 ? matches[0].job : null;
  };

  // 1. Best Overall
  const bestOverall = getBestMatch(() => true);

  // 2. Best Stable W-2
  const bestStableW2 = getBestMatch(j => 
    j.job_type === 'w2' || 
    j.job_type === 'full_time' || 
    j.job_type === 'part_time'
  );

  // 3. Best Own Vehicle
  const bestOwnVehicle = getBestMatch(j => 
    ['own_vehicle', 'car', 'suv', 'sprinter_van', 'cargo_van'].includes(j.vehicle_type)
  );

  // 4. Best Company Vehicle
  const bestCompanyVehicle = getBestMatch(j => j.vehicle_type === 'company_vehicle');

  // 5. Best Medical/Pharmacy
  const bestMedicalPharmacy = getBestMatch(j => {
    const title = j.job_title.toLowerCase();
    const notes = (j.notes || '').toLowerCase();
    return title.includes('medical') || 
           title.includes('pharmacy') || 
           title.includes('specimen') || 
           title.includes('lab') || 
           title.includes('dme') ||
           notes.includes('specimen') ||
           notes.includes('patient');
  });

  // 6. Best Package Delivery
  const bestPackageDelivery = getBestMatch(j => {
    const title = j.job_title.toLowerCase();
    const comp = j.company_name.toLowerCase();
    return title.includes('package') || 
           title.includes('dsp') || 
           title.includes('fedex') || 
           title.includes('ups') || 
           title.includes('dhl') || 
           title.includes('ontrac') ||
           comp.includes('fedex') || 
           comp.includes('ups') || 
           comp.includes('dhl') || 
           comp.includes('ontrac') ||
           comp.includes('amazon');
  });

  // 7. Best Local Courier
  const bestLocalCourier = getBestMatch(j => {
    const title = j.job_title.toLowerCase();
    const comp = j.company_name.toLowerCase();
    return title.includes('local') || 
           title.includes('messenger') || 
           comp.includes('messenger') || 
           comp.includes('courier') ||
           comp.includes('charm city') ||
           comp.includes('local');
  });

  // 8. Jobs to Avoid or Verify (CDL required, low stability, or low scores)
  const jobsToAvoid = jobsWithScores
    .filter(item => {
      const isLowStability = item.job.stability_score <= 5;
      const isCdlRequired = item.job.cdl_required === true;
      const isLowScore = item.score < 60;
      return isLowStability || isCdlRequired || isLowScore;
    })
    .sort((a, b) => a.score - b.score)
    .map(item => item.job);

  return {
    bestOverall,
    bestStableW2,
    bestOwnVehicle,
    bestCompanyVehicle,
    bestMedicalPharmacy,
    bestPackageDelivery,
    bestLocalCourier,
    jobsToAvoid
  };
}
