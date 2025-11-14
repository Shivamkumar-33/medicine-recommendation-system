// Disease prediction logic using symptom matching
export interface Disease {
  name: string;
  confidence: number;
  symptoms: string[];
  medicines: string[];
}

// Comprehensive disease-symptom database
const diseaseDatabase: Record<string, { symptoms: string[], medicines: string[] }> = {
  "Common Cold": {
    symptoms: ["runny nose", "sneezing", "cough", "sore throat", "fatigue", "mild fever"],
    medicines: ["Paracetamol", "Cetirizine", "Dextromethorphan", "Phenylephrine"]
  },
  "Influenza": {
    symptoms: ["high fever", "body aches", "fatigue", "cough", "headache", "chills"],
    medicines: ["Oseltamivir", "Paracetamol", "Ibuprofen"]
  },
  "Migraine": {
    symptoms: ["severe headache", "nausea", "sensitivity to light", "vomiting", "visual disturbances"],
    medicines: ["Sumatriptan", "Ibuprofen", "Paracetamol", "Naproxen"]
  },
  "Hypertension": {
    symptoms: ["headache", "dizziness", "blurred vision", "chest pain", "shortness of breath"],
    medicines: ["Amlodipine", "Losartan", "Metoprolol", "Enalapril"]
  },
  "Diabetes Type 2": {
    symptoms: ["increased thirst", "frequent urination", "fatigue", "blurred vision", "slow healing"],
    medicines: ["Metformin", "Glipizide", "Insulin", "Sitagliptin"]
  },
  "Asthma": {
    symptoms: ["shortness of breath", "wheezing", "chest tightness", "cough", "difficulty breathing"],
    medicines: ["Salbutamol", "Budesonide", "Montelukast", "Theophylline"]
  },
  "Gastritis": {
    symptoms: ["stomach pain", "nausea", "vomiting", "bloating", "indigestion", "loss of appetite"],
    medicines: ["Omeprazole", "Ranitidine", "Antacids", "Sucralfate"]
  },
  "Anxiety Disorder": {
    symptoms: ["excessive worry", "restlessness", "fatigue", "difficulty concentrating", "muscle tension"],
    medicines: ["Sertraline", "Alprazolam", "Buspirone", "Escitalopram"]
  },
  "Allergic Rhinitis": {
    symptoms: ["sneezing", "runny nose", "itchy eyes", "nasal congestion", "postnasal drip"],
    medicines: ["Cetirizine", "Loratadine", "Fluticasone", "Montelukast"]
  },
  "Urinary Tract Infection": {
    symptoms: ["painful urination", "frequent urination", "lower abdominal pain", "cloudy urine", "fever"],
    medicines: ["Ciprofloxacin", "Nitrofurantoin", "Trimethoprim", "Amoxicillin"]
  }
};

export const allSymptoms = Array.from(
  new Set(Object.values(diseaseDatabase).flatMap(d => d.symptoms))
).sort();

export function predictDisease(selectedSymptoms: string[]): Disease[] {
  const predictions: Disease[] = [];
  
  for (const [diseaseName, data] of Object.entries(diseaseDatabase)) {
    const matchingSymptoms = selectedSymptoms.filter(s => 
      data.symptoms.some(ds => ds.toLowerCase().includes(s.toLowerCase()))
    );
    
    if (matchingSymptoms.length > 0) {
      const confidence = (matchingSymptoms.length / data.symptoms.length) * 100;
      predictions.push({
        name: diseaseName,
        confidence: Math.round(confidence),
        symptoms: data.symptoms,
        medicines: data.medicines
      });
    }
  }
  
  return predictions.sort((a, b) => b.confidence - a.confidence);
}

export const diseaseInfo: Record<string, { description: string, diet: string[], precautions: string[] }> = {
  "Common Cold": {
    description: "A viral infection of the upper respiratory tract causing mild symptoms.",
    diet: ["Warm fluids", "Vitamin C rich foods", "Ginger tea", "Honey", "Chicken soup"],
    precautions: ["Get plenty of rest", "Stay hydrated", "Avoid close contact with others", "Wash hands frequently"]
  },
  "Influenza": {
    description: "A contagious respiratory illness caused by influenza viruses.",
    diet: ["Clear broths", "Herbal teas", "Fresh fruits", "Yogurt", "Lean proteins"],
    precautions: ["Stay home and rest", "Cover coughs and sneezes", "Avoid crowds", "Get vaccinated annually"]
  },
  "Migraine": {
    description: "A neurological condition characterized by intense, debilitating headaches.",
    diet: ["Magnesium-rich foods", "Omega-3 fatty acids", "Fresh vegetables", "Whole grains", "Water"],
    precautions: ["Identify triggers", "Maintain sleep schedule", "Reduce stress", "Avoid bright lights"]
  },
  "Hypertension": {
    description: "High blood pressure that can lead to serious cardiovascular complications.",
    diet: ["Low sodium foods", "Fresh fruits", "Vegetables", "Whole grains", "Lean proteins"],
    precautions: ["Monitor blood pressure regularly", "Exercise regularly", "Limit alcohol", "Reduce stress"]
  },
  "Diabetes Type 2": {
    description: "A chronic condition affecting how the body processes blood sugar.",
    diet: ["Whole grains", "Leafy vegetables", "Lean proteins", "Low glycemic foods", "Healthy fats"],
    precautions: ["Monitor blood sugar", "Exercise regularly", "Take medications as prescribed", "Regular checkups"]
  },
  "Asthma": {
    description: "A chronic respiratory condition causing airway inflammation and breathing difficulty.",
    diet: ["Anti-inflammatory foods", "Omega-3 rich fish", "Fresh fruits", "Vegetables", "Adequate water"],
    precautions: ["Avoid triggers", "Use inhaler as prescribed", "Monitor symptoms", "Get flu vaccine"]
  },
  "Gastritis": {
    description: "Inflammation of the stomach lining causing digestive discomfort.",
    diet: ["Bland foods", "Lean proteins", "Non-acidic fruits", "Cooked vegetables", "Whole grains"],
    precautions: ["Avoid spicy foods", "Eat smaller meals", "Avoid alcohol", "Manage stress"]
  },
  "Anxiety Disorder": {
    description: "A mental health condition characterized by excessive worry and fear.",
    diet: ["Complex carbohydrates", "Omega-3 fatty acids", "Probiotics", "Herbal teas", "Magnesium-rich foods"],
    precautions: ["Practice relaxation techniques", "Regular exercise", "Adequate sleep", "Seek therapy"]
  },
  "Allergic Rhinitis": {
    description: "An allergic response causing nasal inflammation and related symptoms.",
    diet: ["Anti-inflammatory foods", "Vitamin C rich foods", "Local honey", "Probiotics", "Omega-3 fatty acids"],
    precautions: ["Avoid allergens", "Keep windows closed", "Use air purifiers", "Shower after outdoor activities"]
  },
  "Urinary Tract Infection": {
    description: "A bacterial infection affecting the urinary system.",
    diet: ["Cranberry juice", "Water", "Probiotics", "Vitamin C rich foods", "Avoid caffeine"],
    precautions: ["Stay hydrated", "Urinate frequently", "Wipe front to back", "Avoid irritating products"]
  }
};
