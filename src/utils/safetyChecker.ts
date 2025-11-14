// Medicine safety checking utilities

export interface MedicineSafety {
  medicine: string;
  isSafe: boolean;
  reason: string;
  price: number;
  category: string;
}

// Drug interaction database
const drugInteractions: Record<string, string[]> = {
  "Warfarin": ["Aspirin", "Ibuprofen", "Naproxen"],
  "Aspirin": ["Warfarin", "Ibuprofen"],
  "Metformin": ["Alcohol"],
  "Insulin": ["Beta blockers", "Corticosteroids"],
  "Sertraline": ["Alprazolam", "MAO inhibitors"],
  "Alprazolam": ["Opioids", "Alcohol", "Sertraline"],
  "Amlodipine": ["Grapefruit"],
  "Simvastatin": ["Grapefruit", "Erythromycin"],
  "Ciprofloxacin": ["Antacids", "Dairy products"],
  "Omeprazole": ["Clopidogrel"]
};

// Medicine prices (generic)
const medicinePrices: Record<string, number> = {
  "Paracetamol": 2.50,
  "Ibuprofen": 3.00,
  "Cetirizine": 4.50,
  "Loratadine": 5.00,
  "Omeprazole": 6.50,
  "Ranitidine": 5.50,
  "Metformin": 8.00,
  "Glipizide": 12.00,
  "Insulin": 25.00,
  "Amlodipine": 7.00,
  "Losartan": 9.00,
  "Metoprolol": 8.50,
  "Enalapril": 7.50,
  "Sertraline": 15.00,
  "Alprazolam": 10.00,
  "Buspirone": 12.50,
  "Escitalopram": 16.00,
  "Salbutamol": 8.00,
  "Budesonide": 18.00,
  "Montelukast": 14.00,
  "Sumatriptan": 22.00,
  "Naproxen": 4.50,
  "Oseltamivir": 35.00,
  "Ciprofloxacin": 11.00,
  "Nitrofurantoin": 13.00,
  "Trimethoprim": 9.50,
  "Amoxicillin": 7.00,
  "Fluticasone": 16.50,
  "Dextromethorphan": 5.50,
  "Phenylephrine": 4.00,
  "Sitagliptin": 28.00,
  "Theophylline": 10.50,
  "Antacids": 3.50,
  "Sucralfate": 11.50
};

const medicineCategories: Record<string, string> = {
  "Paracetamol": "Pain Relief",
  "Ibuprofen": "Anti-inflammatory",
  "Cetirizine": "Antihistamine",
  "Loratadine": "Antihistamine",
  "Omeprazole": "Proton Pump Inhibitor",
  "Ranitidine": "H2 Blocker",
  "Metformin": "Antidiabetic",
  "Insulin": "Antidiabetic",
  "Amlodipine": "Antihypertensive",
  "Sertraline": "Antidepressant",
  "Salbutamol": "Bronchodilator",
  "Sumatriptan": "Antimigraine",
  "Ciprofloxacin": "Antibiotic"
};

export function checkMedicineSafety(
  medicines: string[],
  allergies: string[],
  currentMedications: string[]
): MedicineSafety[] {
  return medicines.map(medicine => {
    // Check for allergy
    const allergyMatch = allergies.some(allergy => 
      medicine.toLowerCase().includes(allergy.toLowerCase()) ||
      allergy.toLowerCase().includes(medicine.toLowerCase())
    );
    
    if (allergyMatch) {
      return {
        medicine,
        isSafe: false,
        reason: `⚠️ Allergy detected`,
        price: medicinePrices[medicine] || 10.00,
        category: medicineCategories[medicine] || "Medication"
      };
    }
    
    // Check for drug interactions
    const interactions = drugInteractions[medicine] || [];
    const interactionFound = interactions.some(drug =>
      currentMedications.some(current => 
        current.toLowerCase().includes(drug.toLowerCase())
      )
    );
    
    if (interactionFound) {
      const interactingDrug = interactions.find(drug =>
        currentMedications.some(current => 
          current.toLowerCase().includes(drug.toLowerCase())
        )
      );
      return {
        medicine,
        isSafe: false,
        reason: `⚠️ Interacts with ${interactingDrug}`,
        price: medicinePrices[medicine] || 10.00,
        category: medicineCategories[medicine] || "Medication"
      };
    }
    
    return {
      medicine,
      isSafe: true,
      reason: "✅ Safe to use",
      price: medicinePrices[medicine] || 10.00,
      category: medicineCategories[medicine] || "Medication"
    };
  });
}

export function calculateSafetyStats(safetyResults: MedicineSafety[]) {
  const safe = safetyResults.filter(r => r.isSafe).length;
  const unsafe = safetyResults.length - safe;
  return { safe, unsafe, total: safetyResults.length };
}
