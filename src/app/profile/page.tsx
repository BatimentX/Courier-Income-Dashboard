'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { UserProfile, WorkExperience, EducationEntry } from '@/types';
import { 
  Upload, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Save,
  ChevronRight
} from 'lucide-react';
import mammoth from 'mammoth';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Parse state feedbacks
  const [parseStatus, setParseStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Profile from DB
  useEffect(() => {
    async function fetchProfile() {
      try {
        const fetched = await db.getProfile();
        setProfile(fetched);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileParsing(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileParsing(e.target.files[0]);
    }
  };

  // Heuristic parser to extract metadata from resume text
  const parseResumeText = (text: string) => {
    setParseStatus("Analyzing text patterns & extracting details...");
    
    // Clean text lines
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    // Heuristic 1: Contact details
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    let email = '';
    let phone = '';
    let name = '';
    
    // Look for first email
    for (const line of lines) {
      const emailMatch = line.match(emailRegex);
      if (emailMatch) {
        email = emailMatch[0];
        break;
      }
    }

    // Look for first phone
    for (const line of lines) {
      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch) {
        phone = phoneMatch[0];
        break;
      }
    }

    // Heuristic: First line is often the name if short (< 4 words)
    if (lines.length > 0 && lines[0].split(/\s+/).length <= 4 && !lines[0].includes('@') && !lines[0].match(/\d/)) {
      name = lines[0];
    } else {
      name = "Applicant";
    }

    // Heuristic 2: Identify potential skills
    const popularSkills = [
      'route optimization', 'defensive driving', 'cargo van', 'sprinter van', 
      'box truck', 'hipaa', 'bloodborne', 'mvr', 'customer service', 'time management',
      'logistics', 'delivery', 'courier', 'navigation', 'physical stamina'
    ];
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    popularSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        // Map to neat capital case
        const mapped: Record<string, string> = {
          'route optimization': 'Route Optimization',
          'defensive driving': 'Defensive Driving',
          'cargo van': 'Cargo Van Logistics',
          'sprinter van': 'Sprinter Operations',
          'box truck': 'Box Truck Operations',
          'hipaa': 'HIPAA Patient Privacy',
          'bloodborne': 'OSHA Bloodborne Pathogens',
          'mvr': 'Clean MVR Status',
          'customer service': 'Customer Service',
          'time management': 'Punctuality & Time Management',
          'logistics': 'Logistics Operations',
          'delivery': 'Safe Parcel Delivery',
          'courier': 'Courier Transport',
          'navigation': 'GPS Navigation Apps',
          'physical stamina': 'Physical Stamina'
        };
        foundSkills.push(mapped[skill]);
      }
    });

    // Heuristic 3: Experience
    const experiences: WorkExperience[] = [];
    // Just a placeholder template for them to review since extracting complex lists is highly variable
    if (lowerText.includes('delivery') || lowerText.includes('driver') || lowerText.includes('courier')) {
      experiences.push({
        company: 'Logistics Service Provider',
        title: 'Delivery Driver / Route Courier',
        start_date: '2022-01',
        end_date: 'Present',
        description: '• Safely completed dedicated daily route deliveries spanning over 120 miles.\n• Matched client invoices to parcel staging manifests.\n• Handled high-priority customer customer interactions and e-signature collections.',
        is_delivery_related: true
      });
    }

    // Heuristic 4: Certifications
    const certsHeld: string[] = [];
    if (lowerText.includes('hipaa')) certsHeld.push('HIPAA Certification');
    if (lowerText.includes('bloodborne') || lowerText.includes('osha')) certsHeld.push('OSHA Bloodborne Pathogens (BBP)');
    if (lowerText.includes('dot physical') || lowerText.includes('medical examiner')) certsHeld.push('DOT Medical Examiner Certificate (DOT Physical)');
    if (lowerText.includes('tsa') || lowerText.includes('sta')) certsHeld.push('TSA Security Threat Assessment (STA)');

    return {
      name,
      email,
      phone,
      skills: foundSkills,
      certsHeld,
      experiences,
      rawText: text
    };
  };

  const handleFileParsing = async (file: File) => {
    setUploading(true);
    setParseStatus(`Uploading and parsing ${file.name}...`);

    try {
      let extractedText = "";

      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const parseResult = await mammoth.extractRawText({ arrayBuffer });
        extractedText = parseResult.value;
      } else if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        
        // Dynamically load pdfjs-dist to prevent Next.js SSR / prerender errors
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        // Load PDF document using pdf.js
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          const pageText = text.items.map((item: any) => item.str).join(' ');
          textContent += pageText + "\n";
        }
        extractedText = textContent;
      } else {
        alert("Unsupported file format. Please upload a .pdf or .docx document.");
        setUploading(false);
        setParseStatus(null);
        return;
      }

      if (!extractedText.trim()) {
        throw new Error("No readable text found in document.");
      }

      // Run heuristics
      const parsed = parseResumeText(extractedText);

      // Merge into current profile
      if (profile) {
        const updatedProfile: UserProfile = {
          ...profile,
          full_name: parsed.name || profile.full_name,
          email: parsed.email || profile.email,
          phone: parsed.phone || profile.phone,
          resume_raw_text: parsed.rawText,
          certifications_held: Array.from(new Set([...profile.certifications_held, ...parsed.certsHeld])),
          skills: Array.from(new Set([...profile.skills, ...parsed.skills])),
          work_history: parsed.experiences.length > 0 ? parsed.experiences : profile.work_history
        };
        setProfile(updatedProfile);
        setParseStatus("Resume successfully uploaded! Auto-filled profile details. Review and save below.");
      }

    } catch (error) {
      console.error("Resume parsing error:", error);
      alert("Failed to parse resume. You can still fill out your profile manually below.");
      setParseStatus(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handleWorkHistoryChange = (index: number, field: keyof WorkExperience, value: any) => {
    if (!profile) return;
    const updatedHistory = [...profile.work_history];
    updatedHistory[index] = {
      ...updatedHistory[index],
      [field]: value
    };
    handleFieldChange('work_history', updatedHistory);
  };

  const handleEducationChange = (index: number, field: keyof EducationEntry, value: any) => {
    if (!profile) return;
    const updatedEdu = [...profile.education];
    updatedEdu[index] = {
      ...updatedEdu[index],
      [field]: value
    };
    handleFieldChange('education', updatedEdu);
  };

  const addWorkEntry = () => {
    if (!profile) return;
    const newEntry: WorkExperience = {
      company: '',
      title: '',
      start_date: '',
      end_date: '',
      description: '',
      is_delivery_related: false
    };
    handleFieldChange('work_history', [...profile.work_history, newEntry]);
  };

  const removeWorkEntry = (index: number) => {
    if (!profile) return;
    const updated = profile.work_history.filter((_, i) => i !== index);
    handleFieldChange('work_history', updated);
  };

  const addEduEntry = () => {
    if (!profile) return;
    const newEntry: EducationEntry = {
      institution: '',
      degree: '',
      year: ''
    };
    handleFieldChange('education', [...profile.education, newEntry]);
  };

  const removeEduEntry = (index: number) => {
    if (!profile) return;
    const updated = profile.education.filter((_, i) => i !== index);
    handleFieldChange('education', updated);
  };

  const handleToggleCert = (certName: string) => {
    if (!profile) return;
    let list = [...profile.certifications_held];
    if (list.includes(certName)) {
      list = list.filter(c => c !== certName);
    } else {
      list.push(certName);
    }
    handleFieldChange('certifications_held', list);
  };

  const [newSkill, setNewSkill] = useState('');
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      handleFieldChange('skills', [...profile.skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    if (!profile) return;
    handleFieldChange('skills', profile.skills.filter(s => s !== skill));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await db.saveProfile(profile);
      alert("Courier profile saved successfully!");
      setParseStatus(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompleteness = (): number => {
    if (!profile) return 0;
    let score = 0;
    if (profile.full_name) score += 15;
    if (profile.email) score += 10;
    if (profile.phone) score += 10;
    if (profile.address && profile.city) score += 10;
    if (profile.summary) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.work_history && profile.work_history.length > 0) score += 15;
    if (profile.education && profile.education.length > 0) score += 10;
    return score;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Syncing Courier Profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  const completeness = calculateProfileCompleteness();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 sm:p-8 border border-indigo-500/10 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full inline-flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Resume Tailoring Core</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
              Smart Profile & Resume Builder
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Upload your base resume. Our client-side parser extracts your key qualifications to build custom ATS-optimized documents tailored to every job automatically.
            </p>
          </div>

          {/* Completeness Ring */}
          <div className="flex items-center space-x-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
            <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-slate-800">
              <div className="text-center">
                <span className="text-lg font-black text-indigo-400">{completeness}%</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Profile Status</span>
              <span className="text-sm font-extrabold text-slate-200">
                {completeness >= 80 ? 'Ready to Apply' : completeness >= 50 ? 'Needs Experience' : 'Incomplete'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Parse Feedback Alert */}
      {parseStatus && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 p-4 rounded-2xl text-xs flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0" />
          <span>{parseStatus}</span>
        </div>
      )}

      {/* Main Form Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: File Uploader and Details */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Uploader Card */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2">
              1. Import Base Resume
            </h3>
            
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-750 hover:border-indigo-500/50 hover:bg-slate-900/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileInputChange}
                disabled={uploading}
              />
              <Upload className={`h-8 w-8 mx-auto mb-3 transition-colors ${uploading ? 'animate-bounce text-indigo-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-slate-300 block mb-1">
                {uploading ? 'Analyzing Documents...' : 'Drag & Drop Base Resume'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Supports PDF or DOCX file (Client-side parsed)
              </span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2">
              2. Core Contact Info
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={e => handleFieldChange('full_name', e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    placeholder="(443) 555-0199"
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={e => handleFieldChange('address', e.target.value)}
                    placeholder="123 Route Highway"
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={e => handleFieldChange('city', e.target.value)}
                    placeholder="Laurel"
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">State</label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={e => handleFieldChange('state', e.target.value)}
                    placeholder="MD"
                    maxLength={2}
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-650 text-center focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={profile.zip}
                  onChange={e => handleFieldChange('zip', e.target.value)}
                  placeholder="20708"
                  className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Professional driving settings, skills, and work history */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Logistics and Vehicle profile */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 flex items-center space-x-1.5">
              <Car className="h-4 w-4 text-indigo-400" />
              <span>3. Vehicle & Driving Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Years driving professionally</label>
                <input
                  type="number"
                  value={profile.years_driving}
                  onChange={e => handleFieldChange('years_driving', Number(e.target.value))}
                  min="0"
                  className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2 pb-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.has_clean_mvr}
                    onChange={e => handleFieldChange('has_clean_mvr', e.target.checked)}
                    className="rounded border-slate-850 bg-[#0a0f1d] text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>Has Clean Driving Record (Clean MVR)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.has_own_vehicle}
                    onChange={e => handleFieldChange('has_own_vehicle', e.target.checked)}
                    className="rounded border-slate-850 bg-[#0a0f1d] text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>Has Own Reliable Vehicle</span>
                </label>
              </div>

              {profile.has_own_vehicle && (
                <div className="sm:col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Describe your personal vehicle (Year, Make, Model, Fuel efficiency)</label>
                  <input
                    type="text"
                    value={profile.vehicle_description || ''}
                    onChange={e => handleFieldChange('vehicle_description', e.target.value)}
                    placeholder="e.g. 2018 Toyota RAV4 Hybrid (40 MPG) - Clean Cargo Trunk"
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Professional Credentials & Skills */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>4. Credentials & Competencies</span>
            </h3>

            {/* Certifications toggles */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Certifications Held</span>
              <div className="flex flex-wrap gap-2">
                {['HIPAA Certification', 'OSHA Bloodborne Pathogens (BBP)', 'TSA Security Threat Assessment (STA)', 'DOT Medical Examiner Certificate (DOT Physical)'].map((cert, index) => {
                  const hasIt = profile.certifications_held.includes(cert);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleToggleCert(cert)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
                        hasIt 
                          ? 'bg-indigo-650/20 border-indigo-500/40 text-indigo-300' 
                          : 'bg-[#0a0f1d] border-slate-850 text-slate-450 hover:bg-slate-900/50'
                      }`}
                    >
                      {cert}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills tag editor */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Core Skills / Strengths</span>
              
              {/* Skill list */}
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900/80 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300">
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Skill input */}
              <form onSubmit={handleAddSkill} className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="Add custom driving/logistics skill..."
                  className="flex-1 bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Professional History */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                <Briefcase className="h-4 w-4 text-violet-400" />
                <span>5. Work History Timeline</span>
              </h3>
              <button
                type="button"
                onClick={addWorkEntry}
                className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {profile.work_history.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">
                No work experience added. Upload a resume or click "Add Position" to populate.
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-850/40">
                {profile.work_history.map((job, index) => (
                  <div key={index} className={`pt-4 first:pt-0 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-350">Experience Entry #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeWorkEntry(index)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/5 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company *</label>
                        <input
                          type="text"
                          value={job.company}
                          onChange={e => handleWorkHistoryChange(index, 'company', e.target.value)}
                          placeholder="Mid-Atlantic Logistics"
                          required
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Job Title *</label>
                        <input
                          type="text"
                          value={job.title}
                          onChange={e => handleWorkHistoryChange(index, 'title', e.target.value)}
                          placeholder="Medical Specimen Driver"
                          required
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Start Date *</label>
                        <input
                          type="month"
                          value={job.start_date}
                          onChange={e => handleWorkHistoryChange(index, 'start_date', e.target.value)}
                          required
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">End Date (Leave blank for current)</label>
                        <input
                          type="month"
                          value={job.end_date}
                          onChange={e => handleWorkHistoryChange(index, 'end_date', e.target.value)}
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center">
                        <label className="flex items-center space-x-2 text-xs font-semibold text-slate-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={job.is_delivery_related}
                            onChange={e => handleWorkHistoryChange(index, 'is_delivery_related', e.target.checked)}
                            className="rounded border-slate-850 bg-[#0a0f1d] text-indigo-500"
                          />
                          <span>This position is a logistics, delivery, or professional driving role</span>
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description / Bullet points (one per line)</label>
                        <textarea
                          value={job.description}
                          onChange={e => handleWorkHistoryChange(index, 'description', e.target.value)}
                          placeholder="• Safely completed dedicated specimen routes daily.&#10;• Maintained strict temperature custody compliance."
                          rows={3}
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-650 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Educational Background */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                <GraduationCap className="h-4 w-4 text-cyan-400" />
                <span>6. Educational Background</span>
              </h3>
              <button
                type="button"
                onClick={addEduEntry}
                className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/10"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {profile.education.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">
                No education history added. Fill manually.
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-850/40">
                {profile.education.map((edu, index) => (
                  <div key={index} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-350">Education Entry #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeEduEntry(index)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/5 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Institution Name *</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={e => handleEducationChange(index, 'institution', e.target.value)}
                          placeholder="Maryland Community College"
                          required
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Graduation Year *</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={e => handleEducationChange(index, 'year', e.target.value)}
                          placeholder="2020"
                          required
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Degree / Certification *</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={e => handleEducationChange(index, 'degree', e.target.value)}
                          placeholder="Associate of Applied Science (Logistics Management) or High School Diploma"
                          required
                          className="w-full bg-[#0a0f1d] border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-650 hover:brightness-110 text-white px-8 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-indigo-650/10 transition-all glow-btn"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Syncing...' : 'Save Courier Profile'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
