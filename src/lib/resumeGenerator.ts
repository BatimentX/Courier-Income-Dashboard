import { UserProfile, Job, WorkExperience } from '../types';

export interface SuccessStep {
  id: string;
  type: 'success' | 'warning' | 'info' | 'action';
  title: string;
  description: string;
  action_link?: string;
}

export function generateTailoredResume(profile: UserProfile, job: Job): UserProfile {
  // 1. Sort work experience: delivery-related first
  const sortedWork = [...profile.work_history].sort((a, b) => {
    if (a.is_delivery_related && !b.is_delivery_related) return -1;
    if (!a.is_delivery_related && b.is_delivery_related) return 1;
    return 0; // maintain original chronological order
  });

  // 2. Adjust professional summary based on job category
  const titleLower = job.job_title.toLowerCase();
  const descLower = (job.notes || '').toLowerCase();
  const company = job.company_name;

  let tailoredSummary = profile.summary;
  
  const yearsExp = profile.years_driving > 0 ? `${profile.years_driving}+ years` : 'Experienced';
  const mvrText = profile.has_clean_mvr ? 'a flawless driving record (clean MVR)' : 'solid driving experience';
  const vehicleText = profile.has_own_vehicle && profile.vehicle_description 
    ? `using a highly reliable personal vehicle (${profile.vehicle_description})` 
    : 'operating company fleet vehicles';

  if (titleLower.includes('medical') || titleLower.includes('specimen') || descLower.includes('hipaa') || descLower.includes('bbp')) {
    tailoredSummary = `Dedicated and safety-conscious Professional Courier with ${yearsExp} of driving experience and ${mvrText}. Specializing in medical and specimen logistics, with complete training in HIPAA and OSHA Bloodborne Pathogens (BBP) standards. Proven track record of executing precise route schedules, maintaining sample temperature integrity, and ensuring secure chain of custody for high-priority diagnostic specimens. Committed to delivering compassion and accuracy for ${company}.`;
  } else if (titleLower.includes('pharmacy') || titleLower.includes('medication') || titleLower.includes('prescription')) {
    tailoredSummary = `Reliable, customer-focused Delivery Specialist with ${yearsExp} of logistics experience. Focused on secure, time-sensitive pharmacy and prescription deliveries to long-term care facilities and residential homes. Armed with ${mvrText} and exceptional routing efficiency. Recognized for maintaining strict HIPAA confidentiality and delivering professional, warm service to vulnerable patient populations on behalf of ${company}.`;
  } else if (titleLower.includes('amazon') || titleLower.includes('dsp') || titleLower.includes('fedex') || titleLower.includes('ups') || titleLower.includes('dhl') || titleLower.includes('parcel')) {
    tailoredSummary = `High-energy, physically fit Logistics Route Driver with ${yearsExp} of commercial and residential parcel delivery experience. Expert at managing high-density routes (150+ stops/day) with outstanding safety, speed, and accuracy. Proven capability in driving cargo vans and step-vans, loading and staging payloads, and hitting elite performance metrics. Excels under pressure in dynamic delivery environments to represent ${company} with maximum professionalism.`;
  } else if (titleLower.includes('box truck') || titleLower.includes('heavy') || titleLower.includes('freight')) {
    tailoredSummary = `Professional W-2 Route Driver with ${yearsExp} of commercial box truck experience, possessing a valid DOT Medical Examiner's Certificate and ${mvrText}. Skilled in secure cargo loading, liftgate operations, pallet jack utilization, and local commercial deliveries. Exceptional route planning capabilities, focusing on zero transit damages, fleet safety, and elite customer service for ${company}.`;
  } else if (titleLower.includes('parts') || titleLower.includes('auto') || titleLower.includes('napa') || titleLower.includes('advance')) {
    tailoredSummary = `Punctual and highly reliable Store Delivery Driver with ${yearsExp} of experience in retail logistics. Expert at organizing parts invoices, loading warehouse shipments safely, and providing professional B2B deliveries to local auto repair garages. Recognized for maintaining ${mvrText}, safe fleet vehicle operations, and friendly commercial client relationships on behalf of ${company}.`;
  } else {
    tailoredSummary = `Punctual, safety-focused Logistics Route Driver with ${yearsExp} of delivery experience and ${mvrText}. Expert at optimizing routes across the Baltimore/Laurel metropolitan area ${vehicleText}. Highly organized, detail-oriented, and skilled in secure cargo handling, mobile logistics applications, and high-standard customer service for ${company}.`;
  }

  // 3. Tailor Skills: Select/Prioritize skills based on job criteria
  const baseSkills = [...profile.skills];
  const jobSkills: string[] = [];

  // Add job-specific primary skills
  if (titleLower.includes('medical') || titleLower.includes('specimen')) {
    jobSkills.push('Specimen Handling', 'Chain of Custody Specimen Logistics', 'HIPAA Privacy Standards', 'OSHA Bloodborne Pathogens compliance', 'Temperature-Controlled Transport', 'Clinical Hub Routing');
  }
  if (titleLower.includes('pharmacy') || titleLower.includes('prescription')) {
    jobSkills.push('LTC Pharmacy Deliveries', 'HIPAA Patient Privacy Standards', 'Secure Chain of Custody', 'B2C Route Management', 'E-Signature Platforms');
  }
  if (titleLower.includes('amazon') || titleLower.includes('dsp') || titleLower.includes('fedex') || titleLower.includes('ups') || titleLower.includes('dhl')) {
    jobSkills.push('High-Density Multi-Stop Dispatching', 'Handheld Scanner (Rabbit/Zebra)', 'Safe Parcel Staging', 'Commercial step-van operations', 'Defensive Driving (Space Margin)');
  }
  if (titleLower.includes('box truck') || titleLower.includes('freight')) {
    jobSkills.push('DOT Safety Regulations', 'Pre-Trip/Post-Trip Inspections', 'Medium-Duty Liftgate Operations', 'Dock-High Load Staging', 'Palletizing & Tie-Down Securing');
  }
  if (titleLower.includes('parts')) {
    jobSkills.push('B2B Commercial Delivery', 'Store Invoice Matching', 'Light-Duty Parts Handling', 'Store Fleet Safe Operations', 'Friendly Client Relations');
  }

  // General helpful driving skills
  jobSkills.push('Baltimore/Laurel Geographic Knowledge', 'Defensive Driving Tactics', 'GPS Route Optimization Apps', 'Smart Delivery Mobile Apps', 'Time Management');

  // Merge, deduplicate, and limit to top 10 most relevant skills
  const mergedSkills = Array.from(new Set([...jobSkills, ...baseSkills])).slice(0, 10);

  return {
    ...profile,
    summary: tailoredSummary,
    work_history: sortedWork,
    skills: mergedSkills
  };
}

export function generateCoverLetter(profile: UserProfile, job: Job): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const name = profile.full_name || '[Your Name]';
  const email = profile.email || 'your.email@example.com';
  const phone = profile.phone || '(443) 555-0199';
  const address = `${profile.address || 'Street Address'}, ${profile.city || 'Laurel'}, ${profile.state || 'MD'} ${profile.zip || '20708'}`;
  
  const title = job.job_title;
  const company = job.company_name;
  const location = job.location;
  
  // Custom Body Paragraphs depending on job types
  let bodyParagraph = '';
  let complianceMention = '';
  let vehicleMention = '';

  const matchedCerts = job.required_certifications.filter(c => profile.certifications_held.includes(c));
  const missingCerts = job.required_certifications.filter(c => !profile.certifications_held.includes(c));

  if (matchedCerts.length > 0) {
    complianceMention = `I already hold active credentials in ${matchedCerts.join(' and ')}, which are highly critical for this specific operation. This allows me to onboard immediately and execute deliveries in complete alignment with professional compliance standards.`;
  } else if (job.required_certifications.length > 0) {
    complianceMention = `I am highly familiar with your compliance requirements including ${job.required_certifications.join(', ')} and am prepared to undergo rapid certification clearance to step into the routes immediately.`;
  }

  if (job.vehicle_type === 'company_vehicle') {
    vehicleMention = `I am highly enthusiastic about representing ${company} on the road and operating your company fleet vehicles with maximum safety and responsibility. My history of safe driving translates perfectly into maintaining your company Prius, cargo vans, or step-vans in excellent operating condition.`;
  } else if (job.vehicle_type === 'own_vehicle' || job.vehicle_type === 'sprinter_van' || job.vehicle_type === 'cargo_van') {
    const vType = job.vehicle_type.replace('_', ' ');
    const vDesc = profile.vehicle_description ? `, a reliable ${profile.vehicle_description},` : '';
    vehicleMention = `I possess my own fully insured ${vType}${vDesc} that meets all cargo requirements for your route. I maintain my personal vehicle to rigorous mechanical standards, guaranteeing 100% daily dispatch reliability and seamless cargo safety.`;
  }

  const titleLower = job.job_title.toLowerCase();
  
  if (titleLower.includes('medical') || titleLower.includes('specimen') || titleLower.includes('pharmacy')) {
    bodyParagraph = `My experience matches the highly specific demands of healthcare logistics. I understand that a specimen or pharmaceutical parcel is not just a package, but represents a patient awaiting critical treatment. I excel at maintaining secure chains of custody, tracking precise temperature profiles for biological collections, and complying with all medical confidentiality guidelines. I am highly comfortable building warm, respectful B2B relationships with lab clinicians and B2C rapport with elderly patients.`;
  } else if (titleLower.includes('amazon') || titleLower.includes('dsp') || titleLower.includes('fedex') || titleLower.includes('ups') || titleLower.includes('dhl')) {
    bodyParagraph = `I thrive in high-volume routing operations that require physical stamina, speed, and continuous focus. I am highly proficient with smart delivery scanners, warehouse staging, and defensive driving tactics in heavy Baltimore traffic. Over my career, I have prided myself on achieving 99%+ on-time delivery rates while safely navigating residential neighborhoods and commercial docks.`;
  } else if (titleLower.includes('box truck') || titleLower.includes('heavy') || titleLower.includes('freight')) {
    bodyParagraph = `I am fully equipped to handle medium-duty commercial deliveries. I am experienced in pre-trip safety audits, managing freight logs, and operating heavy liftgate mechanisms safely. I am physically resilient, comfortable handling bulky cargos up to 75 lbs, and dedicated to maintaining the highest road safety metrics.`;
  } else {
    bodyParagraph = `In my professional driving history, I have built deep geographic familiarity with the Baltimore, Rosedale, Columbia, and Laurel corridors. I understand how to bypass congestion, coordinate courier stand-by schedules, and manage cargo staging to maximize route revenue. I treat every client, store manager, and dispatcher with maximum respect to ensure seamless operations.`;
  }

  return `
${name}
${address}
${phone} | ${email}

${today}

Hiring Coordinator
${company}
${location}

RE: Application for ${title}

Dear Hiring Coordinator,

I am writing to express my strong interest in the ${title} position currently open at ${company}. As a professional route driver with a proven track record of safe driving, stellar punctuality, and a clean motor vehicle record, I am confident that I can deliver exceptional service and absolute routing reliability to your team near Baltimore.

${bodyParagraph}

${complianceMention} ${vehicleMention}

Furthermore, my residential location in the Baltimore/Laurel area allows me to commute easily to your dispatch hub and provides me with deep local geographic knowledge. I am highly motivated to establish a long-term, stable relationship with ${company} and can adapt seamlessly to your scheduling needs.

Thank you very much for your time and consideration. I have attached my tailored resume for your review and would welcome the opportunity to discuss how my logistics experience can support your routes.

Sincerely,

${name}
  `.trim();
}

export function generateSuccessStrategy(profile: UserProfile, job: Job): SuccessStep[] {
  const steps: SuccessStep[] = [];
  const titleLower = job.job_title.toLowerCase();

  // Step 1: Certification Audit
  const matchedCerts = job.required_certifications.filter(c => profile.certifications_held.includes(c));
  const missingCerts = job.required_certifications.filter(c => !profile.certifications_held.includes(c));

  if (missingCerts.length > 0) {
    steps.push({
      id: 'step-certs-missing',
      type: 'warning',
      title: 'Action Required: Fast-Track Missing Certifications',
      description: `This job requires ${missingCerts.join(', ')}. Go to the "Certifications Manager" tab to unlock instant online courses. HIPAA and OSHA BBP can be completed in under 2 hours for less than $30, which will instantly upgrade your resume.`,
      action_link: '/certifications'
    });
  } else if (matchedCerts.length > 0) {
    steps.push({
      id: 'step-certs-matched',
      type: 'success',
      title: 'Certification Match Secured!',
      description: `Excellent work! You already hold all certifications required for this position (${matchedCerts.join(', ')}). Your resume highlights these clearly at the very top.`,
      action_link: '/profile'
    });
  } else {
    steps.push({
      id: 'step-certs-none',
      type: 'info',
      title: 'No Certifications Required',
      description: 'This position does not list mandatory compliance credentials. You can apply immediately without any delay.',
    });
  }

  // Step 2: Application Timing Guidance
  let bestDay = 'Tuesday morning (between 7:00 AM and 10:00 AM)';
  let timingTip = 'Logistics dispatch managers typically review candidate lists early in the week after weekend route adjustments.';

  if (titleLower.includes('amazon') || titleLower.includes('dsp')) {
    bestDay = 'Friday or Saturday afternoon';
    timingTip = 'Amazon DSPs heavily recruit right before their busy weekend shifts and route expansions.';
  } else if (titleLower.includes('medical') || titleLower.includes('specimen')) {
    bestDay = 'Monday morning';
    timingTip = 'Medical labs re-route routes every Monday morning and review courier capacity to cover weekend backlogs.';
  }

  steps.push({
    id: 'step-timing',
    type: 'info',
    title: 'Optimal Application Window',
    description: `For maximum visibility, apply on ${bestDay}. ${timingTip}`
  });

  // Step 3: Interview Preparation
  let prepTip = 'Prepare to speak about your geographic familiarity with Baltimore highways (I-95, I-695, I-295, MD-295) and how you handle severe weather delays.';
  if (titleLower.includes('medical') || titleLower.includes('specimen')) {
    prepTip = 'Be ready to describe how you ensure "Chain of Custody" and what you would do if a diagnostic specimen vial was cracked or leaking (always refer to safety kit, gloves, and immediately calling dispatch).';
  } else if (titleLower.includes('amazon') || titleLower.includes('dsp') || titleLower.includes('fedex') || titleLower.includes('ups')) {
    prepTip = 'Highlight your physical stamina. Mention you are comfortable with high-density parcel delivery (100+ stops a day) and focus heavily on safety rules like wearing your seatbelt and parking break at every single stop.';
  } else if (job.vehicle_type === 'own_vehicle') {
    prepTip = 'Ensure your personal vehicle is completely clean. The interviewer will likely walk out to look at your car. Bring high-quality photos of your cargo space/trunk to show it is empty and ready for cargo load.';
  }

  steps.push({
    id: 'step-interview',
    type: 'action',
    title: 'Courier Interview Strategy',
    description: prepTip
  });

  // Step 4: What to Bring/Submit
  let documents = 'tailored resume, tailored cover letter, and your current valid driver’s license.';
  if (job.mvr_check_required) {
    documents += ' Also bring a printed copy of your certified clean MVR (driving record) which you can download from the Maryland MVA website for $9. Having this ready in hand speeds up hiring by 5 days.';
  }
  if (profile.certifications_held.length > 0) {
    documents += ` Print and attach your certificates for: ${profile.certifications_held.join(', ')}.`;
  }

  steps.push({
    id: 'step-docs',
    type: 'action',
    title: 'Prepare Your "Fast Pass" Hiring Packet',
    description: `When submiting or going in for an interview, bundle these: ${documents}`
  });

  // Step 5: Follow-Up Timeline
  steps.push({
    id: 'step-followup',
    type: 'info',
    title: 'Recommended Follow-Up Routine',
    description: 'Day 2: Send a polite follow-up email confirming your resume submission. Day 5: If no response, call the main store or dispatch office between 1:00 PM and 3:00 PM (avoid early morning peak hours) and ask to speak with the hiring manager regarding your route driver application.'
  });

  // Step 6: Salary Negotiation Helper
  const midPoint = (job.pay_min + job.pay_max) / 2;
  let negoStrategy = `Since this job pays $${job.pay_min.toFixed(2)} - $${job.pay_max.toFixed(2)} / ${job.pay_type}, `;
  if (profile.years_driving >= 3 && matchedCerts.length > 0) {
    negoStrategy += `anchor your rate request at $${(midPoint + (job.pay_max - midPoint) * 0.5).toFixed(2)}. Highlight your ${profile.years_driving} years of driving and complete certifications as justification for the upper bracket pay.`;
  } else {
    negoStrategy += `aim to request $${midPoint.toFixed(2)}. Emphasize your clean driving record (MVR) and immediate availability to cover open shifts.`;
  }

  steps.push({
    id: 'step-salary',
    type: 'info',
    title: 'Target Salary Negotiation Strategy',
    description: negoStrategy
  });

  return steps;
}
