// Document analysis and medical keyword extraction

export interface ExtractedKeyword {
  keyword: string;
  category: 'symptom' | 'disease' | 'medication' | 'test' | 'vital' | 'diagnosis';
  confidence: number;
  context?: string;
}

export interface DocumentAnalysis {
  extractedText: string;
  keywords: ExtractedKeyword[];
  identifiedSymptoms: string[];
  identifiedMedications: string[];
  identifiedDiseases: string[];
  testResults: string[];
  vitalSigns: Record<string, string>;
  summary: string;
}

// Medical keyword patterns
const medicalKeywords = {
  symptoms: [
    'fever', 'cough', 'headache', 'pain', 'nausea', 'vomiting', 'diarrhea', 'constipation',
    'fatigue', 'weakness', 'dizziness', 'shortness of breath', 'chest pain', 'abdominal pain',
    'joint pain', 'muscle pain', 'back pain', 'sore throat', 'runny nose', 'sneezing',
    'congestion', 'wheezing', 'rash', 'itching', 'swelling', 'inflammation', 'bleeding',
    'bruising', 'numbness', 'tingling', 'blurred vision', 'double vision', 'hearing loss',
    'tinnitus', 'loss of appetite', 'weight loss', 'weight gain', 'insomnia', 'anxiety',
    'depression', 'confusion', 'memory loss', 'seizure', 'tremor', 'palpitations',
    'irregular heartbeat', 'high blood pressure', 'low blood pressure', 'frequent urination',
    'painful urination', 'blood in urine', 'blood in stool', 'jaundice', 'yellowing'
  ],
  diseases: [
    'diabetes', 'hypertension', 'asthma', 'copd', 'pneumonia', 'bronchitis', 'flu',
    'influenza', 'common cold', 'migraine', 'gastritis', 'ulcer', 'gastroenteritis',
    'uti', 'urinary tract infection', 'kidney infection', 'hepatitis', 'cirrhosis',
    'anemia', 'leukemia', 'cancer', 'tumor', 'carcinoma', 'arthritis', 'osteoporosis',
    'osteoporosis', 'fibromyalgia', 'lupus', 'rheumatoid arthritis', 'psoriasis',
    'eczema', 'dermatitis', 'allergy', 'allergic reaction', 'anaphylaxis', 'sepsis',
    'infection', 'bacterial infection', 'viral infection', 'fungal infection',
    'heart disease', 'coronary artery disease', 'heart failure', 'stroke', 'tia',
    'transient ischemic attack', 'epilepsy', 'parkinson', 'alzheimer', 'dementia'
  ],
  medications: [
    'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'naproxen', 'diclofenac',
    'metformin', 'insulin', 'glipizide', 'sitagliptin', 'amlodipine', 'losartan',
    'metoprolol', 'enalapril', 'lisinopril', 'atorvastatin', 'simvastatin', 'pravastatin',
    'omeprazole', 'pantoprazole', 'ranitidine', 'cimetidine', 'sertraline', 'fluoxetine',
    'citalopram', 'escitalopram', 'alprazolam', 'lorazepam', 'diazepam', 'salbutamol',
    'albuterol', 'budesonide', 'fluticasone', 'montelukast', 'cetirizine', 'loratadine',
    'fexofenadine', 'ciprofloxacin', 'amoxicillin', 'azithromycin', 'doxycycline',
    'penicillin', 'cephalexin', 'nitrofurantoin', 'trimethoprim', 'sumatriptan',
    'rizatriptan', 'warfarin', 'heparin', 'clopidogrel', 'aspirin'
  ],
  tests: [
    'blood test', 'cbc', 'complete blood count', 'lipid panel', 'liver function test',
    'lft', 'kidney function test', 'kft', 'glucose test', 'hba1c', 'hemoglobin a1c',
    'cholesterol', 'triglycerides', 'creatinine', 'bun', 'alt', 'ast', 'bilirubin',
    'urine test', 'urinalysis', 'culture', 'x-ray', 'ct scan', 'mri', 'ultrasound',
    'ecg', 'ekg', 'echocardiogram', 'stress test', 'biopsy', 'endoscopy', 'colonoscopy',
    'mammogram', 'pap smear', 'psa test', 'thyroid test', 'tsh', 't3', 't4',
    'vitamin d', 'b12', 'folate', 'iron', 'ferritin'
  ],
  vitals: [
    'blood pressure', 'bp', 'systolic', 'diastolic', 'heart rate', 'pulse', 'hr',
    'temperature', 'temp', 'fever', 'respiratory rate', 'rr', 'oxygen saturation',
    'spo2', 'o2 sat', 'weight', 'height', 'bmi', 'body mass index', 'blood sugar',
    'glucose', 'blood glucose', 'random blood sugar', 'fasting blood sugar', 'fbs',
    'postprandial', 'ppbs'
  ]
};

// Extract text from file (supports text files, will need enhancement for PDF/DOCX)
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF, we'll use a simple approach - in production, use a PDF library
      const reader = new FileReader();
      reader.onload = () => {
        // Basic PDF text extraction would require a library like pdf.js
        // For now, we'll return a placeholder
        resolve("PDF file detected. Please convert to text format for full analysis. PDF text extraction requires additional libraries.");
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file type. Please upload a .txt or .pdf file.'));
    }
  });
}

// Identify medical keywords in text
export function identifyMedicalKeywords(text: string): ExtractedKeyword[] {
  const keywords: ExtractedKeyword[] = [];
  const lowerText = text.toLowerCase();
  
  // Identify symptoms
  medicalKeywords.symptoms.forEach(symptom => {
    const regex = new RegExp(`\\b${symptom.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const context = extractContext(text, symptom, 50);
      keywords.push({
        keyword: symptom,
        category: 'symptom',
        confidence: calculateConfidence(matches.length, text.length),
        context
      });
    }
  });
  
  // Identify diseases
  medicalKeywords.diseases.forEach(disease => {
    const regex = new RegExp(`\\b${disease.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const context = extractContext(text, disease, 50);
      keywords.push({
        keyword: disease,
        category: 'disease',
        confidence: calculateConfidence(matches.length, text.length),
        context
      });
    }
  });
  
  // Identify medications
  medicalKeywords.medications.forEach(med => {
    const regex = new RegExp(`\\b${med.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const context = extractContext(text, med, 50);
      keywords.push({
        keyword: med,
        category: 'medication',
        confidence: calculateConfidence(matches.length, text.length),
        context
      });
    }
  });
  
  // Identify test results
  medicalKeywords.tests.forEach(test => {
    const regex = new RegExp(`\\b${test.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const context = extractContext(text, test, 50);
      keywords.push({
        keyword: test,
        category: 'test',
        confidence: calculateConfidence(matches.length, text.length),
        context
      });
    }
  });
  
  // Identify vital signs
  medicalKeywords.vitals.forEach(vital => {
    const regex = new RegExp(`\\b${vital.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      const context = extractContext(text, vital, 50);
      keywords.push({
        keyword: vital,
        category: 'vital',
        confidence: calculateConfidence(matches.length, text.length),
        context
      });
    }
  });
  
  return keywords;
}

// Extract context around a keyword
function extractContext(text: string, keyword: string, contextLength: number): string {
  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return '';
  
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + keyword.length + contextLength);
  return text.substring(start, end).trim();
}

// Calculate confidence based on frequency and text length
function calculateConfidence(matches: number, textLength: number): number {
  const baseConfidence = Math.min(100, matches * 20);
  const lengthFactor = Math.min(1, textLength / 1000);
  return Math.round(baseConfidence * lengthFactor);
}

// Extract vital signs with values
export function extractVitalSigns(text: string): Record<string, string> {
  const vitals: Record<string, string> = {};
  const lowerText = text.toLowerCase();
  
  // Blood pressure pattern: "120/80" or "BP: 120/80"
  const bpMatch = text.match(/(?:blood pressure|bp)[\s:]*(\d{2,3})\s*\/\s*(\d{2,3})/i);
  if (bpMatch) {
    vitals['blood_pressure'] = `${bpMatch[1]}/${bpMatch[2]}`;
  }
  
  // Heart rate pattern: "HR: 72" or "pulse: 72 bpm"
  const hrMatch = text.match(/(?:heart rate|pulse|hr)[\s:]*(\d{2,3})\s*(?:bpm)?/i);
  if (hrMatch) {
    vitals['heart_rate'] = hrMatch[1];
  }
  
  // Temperature pattern: "98.6°F" or "37°C" or "temp: 98.6"
  const tempMatch = text.match(/(?:temperature|temp)[\s:]*(\d{2,3}\.?\d*)\s*[°f°c]?/i);
  if (tempMatch) {
    vitals['temperature'] = tempMatch[1];
  }
  
  // Blood sugar/glucose pattern: "glucose: 100" or "blood sugar: 100 mg/dL"
  const glucoseMatch = text.match(/(?:blood sugar|glucose|blood glucose)[\s:]*(\d{2,3})\s*(?:mg\/dl)?/i);
  if (glucoseMatch) {
    vitals['blood_glucose'] = glucoseMatch[1];
  }
  
  // Weight pattern: "weight: 70 kg" or "70 kg"
  const weightMatch = text.match(/(?:weight)[\s:]*(\d{2,3}\.?\d*)\s*(?:kg|lbs?)/i);
  if (weightMatch) {
    vitals['weight'] = weightMatch[1];
  }
  
  return vitals;
}

// Analyze document and extract all relevant information
export async function analyzeDocument(file: File): Promise<DocumentAnalysis> {
  const extractedText = await extractTextFromFile(file);
  const keywords = identifyMedicalKeywords(extractedText);
  
  const identifiedSymptoms = keywords
    .filter(k => k.category === 'symptom')
    .map(k => k.keyword);
  
  const identifiedMedications = keywords
    .filter(k => k.category === 'medication')
    .map(k => k.keyword);
  
  const identifiedDiseases = keywords
    .filter(k => k.category === 'disease')
    .map(k => k.keyword);
  
  const testResults = keywords
    .filter(k => k.category === 'test')
    .map(k => k.keyword);
  
  const vitalSigns = extractVitalSigns(extractedText);
  
  // Generate summary
  const summary = generateSummary(
    identifiedSymptoms,
    identifiedDiseases,
    identifiedMedications,
    testResults,
    vitalSigns
  );
  
  return {
    extractedText,
    keywords,
    identifiedSymptoms,
    identifiedMedications,
    identifiedDiseases,
    testResults,
    vitalSigns,
    summary
  };
}

// Generate a summary of the document analysis
function generateSummary(
  symptoms: string[],
  diseases: string[],
  medications: string[],
  tests: string[],
  vitals: Record<string, string>
): string {
  const parts: string[] = [];
  
  if (symptoms.length > 0) {
    parts.push(`Identified ${symptoms.length} symptom(s): ${symptoms.slice(0, 5).join(', ')}${symptoms.length > 5 ? '...' : ''}`);
  }
  
  if (diseases.length > 0) {
    parts.push(`Mentioned condition(s): ${diseases.join(', ')}`);
  }
  
  if (medications.length > 0) {
    parts.push(`Medication(s) found: ${medications.join(', ')}`);
  }
  
  if (tests.length > 0) {
    parts.push(`Test(s) mentioned: ${tests.slice(0, 3).join(', ')}${tests.length > 3 ? '...' : ''}`);
  }
  
  if (Object.keys(vitals).length > 0) {
    parts.push(`Vital signs: ${Object.entries(vitals).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(', ')}`);
  }
  
  return parts.length > 0 ? parts.join('. ') : 'No significant medical information detected in the document.';
}

