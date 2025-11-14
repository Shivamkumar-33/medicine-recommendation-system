import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";
import { allSymptoms } from "@/utils/diseasePredictor";
import { toast } from "sonner";

interface PredictionFormProps {
  onSubmit: (data: {
    symptoms: string[];
    allergies: string[];
    currentMeds: string[];
  }) => void;
}

export const PredictionForm = ({ onSubmit }: PredictionFormProps) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMeds, setCurrentMeds] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [medInput, setMedInput] = useState("");

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies(prev => [...prev, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const addMed = () => {
    if (medInput.trim()) {
      setCurrentMeds(prev => [...prev, medInput.trim()]);
      setMedInput("");
    }
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }
    onSubmit({ symptoms: selectedSymptoms, allergies, currentMeds });
  };

  return (
    <Card className="border-2 shadow-lg hover-lift animate-scale-in">
      <CardHeader className="bg-accent">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
          Patient Assessment
        </CardTitle>
        <CardDescription>Select symptoms and provide medical history</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Symptoms Selection */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Select Your Symptoms *
          </Label>
          <div className="flex flex-wrap gap-2">
            {allSymptoms.map((symptom, idx) => (
              <Badge
                key={symptom}
                variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                className={`cursor-pointer px-3 py-2 text-sm hover-lift transition-smooth ${
                  selectedSymptoms.includes(symptom) ? 'animate-pulse-glow' : ''
                }`}
                onClick={() => toggleSymptom(symptom)}
                style={{ animationDelay: `${idx * 0.02}s` }}
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <Label className="text-base font-semibold mb-2 block">
            Known Allergies (Optional)
          </Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., Penicillin, Sulfa"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAllergy()}
            />
            <Button onClick={addAllergy} variant="secondary">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, idx) => (
              <Badge key={idx} variant="destructive" className="px-3 py-1">
                {allergy}
                <X
                  className="w-3 h-3 ml-2 cursor-pointer"
                  onClick={() => setAllergies(prev => prev.filter((_, i) => i !== idx))}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Current Medications */}
        <div>
          <Label className="text-base font-semibold mb-2 block">
            Current Medications (Optional)
          </Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., Aspirin, Metformin"
              value={medInput}
              onChange={(e) => setMedInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMed()}
            />
            <Button onClick={addMed} variant="secondary">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentMeds.map((med, idx) => (
              <Badge key={idx} variant="outline" className="px-3 py-1 border-secondary">
                {med}
                <X
                  className="w-3 h-3 ml-2 cursor-pointer"
                  onClick={() => setCurrentMeds(prev => prev.filter((_, i) => i !== idx))}
                />
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full py-6 text-lg font-semibold hover-lift hover-glow transition-smooth"
          size="lg"
        >
          🔍 Analyze & Get Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};
