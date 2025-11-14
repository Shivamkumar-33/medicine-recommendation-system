import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MedicalHeader } from "@/components/MedicalHeader";
import { PredictionForm } from "@/components/PredictionForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { SafetyChart } from "@/components/SafetyChart";
import { DocumentAnalyzer } from "@/components/DocumentAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { predictDisease, Disease } from "@/utils/diseasePredictor";
import { checkMedicineSafety, MedicineSafety } from "@/utils/safetyChecker";
import { generatePDFReport } from "@/utils/pdfGenerator";
import { shareReport } from "@/utils/sharing";
import { Download, RotateCcw, Info, User, LogIn, History, Activity } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [safetyResults, setSafetyResults] = useState<MedicineSafety[]>([]);
  const [lastAssessmentData, setLastAssessmentData] = useState<any>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMeds, setCurrentMeds] = useState<string[]>([]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePrediction = async (data: {
    symptoms: string[];
    allergies: string[];
    currentMeds: string[];
  }) => {
    setAllergies(data.allergies);
    setCurrentMeds(data.currentMeds);
    
    const predictions = predictDisease(data.symptoms);
    
    if (predictions.length === 0) {
      toast.error("No matching conditions found. Please try different symptoms.");
      return;
    }

    setDiseases(predictions);
    
    const topDisease = predictions[0];
    const safety = checkMedicineSafety(
      topDisease.medicines,
      data.allergies,
      data.currentMeds
    );
    
    setSafetyResults(safety);
    setLastAssessmentData({ data, topDisease, safety });
    
    toast.success(`Analysis complete! Found ${predictions.length} possible condition(s).`, {
      duration: 3000,
    });

    // Save to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from("assessments")
          .insert([{
            user_id: user.id,
            predicted_disease: topDisease.name,
            confidence: topDisease.confidence,
            symptoms: data.symptoms,
            allergies: data.allergies,
            current_medications: data.currentMeds,
            recommended_medicines: safety as any,
          }]);

        if (error) throw error;
        toast.success("Assessment saved to your history!");
      } catch (error: any) {
        console.error("Error saving assessment:", error);
      }
    }

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    setUser(null);
  };

  const handleReset = () => {
    setDiseases([]);
    setSafetyResults([]);
    setAllergies([]);
    setCurrentMeds([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDocumentAnalysis = (data: {
    diseases: Disease[];
    safetyResults: MedicineSafety[];
    analysis: any;
  }) => {
    setDiseases(data.diseases);
    setSafetyResults(data.safetyResults);
    
    if (data.diseases.length > 0) {
      const topDisease = data.diseases[0];
      setLastAssessmentData({ 
        data: { 
          symptoms: data.analysis.identifiedSymptoms,
          allergies: allergies,
          currentMeds: currentMeds
        }, 
        topDisease, 
        safety: data.safetyResults 
      });

      // Save to database if user is logged in
      if (user) {
        (async () => {
          try {
            const { error } = await supabase
              .from("assessments")
              .insert([{
                user_id: user.id,
                predicted_disease: topDisease.name,
                confidence: topDisease.confidence,
                symptoms: data.analysis.identifiedSymptoms,
                allergies: allergies,
                current_medications: currentMeds,
                recommended_medicines: data.safetyResults as any,
              }]);
            
            if (error) throw error;
            toast.success("Assessment saved to your history!");
          } catch (error: any) {
            console.error("Error saving assessment:", error);
          }
        })();
      }

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleDownloadPDF = async () => {
    if (!lastAssessmentData) {
      toast.error("No assessment data available to generate report");
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      await generatePDFReport({
        userInfo: authUser ? {
          name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || undefined,
          email: authUser.email || undefined
        } : undefined,
        assessment: {
          date: new Date().toLocaleDateString(),
          diseases: diseases,
          safetyResults: safetyResults,
          symptoms: lastAssessmentData.data.symptoms,
          allergies: lastAssessmentData.data.allergies,
          currentMedications: lastAssessmentData.data.currentMeds
        }
      });
      
      toast.success("PDF report generated! Check your print dialog.");
    } catch (error: any) {
      toast.error("Failed to generate PDF", {
        description: error.message || "Please try again"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MedicalHeader />

        {/* Navigation Bar */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
          <div className="flex gap-2">
            <Link to="/about">
              <Button variant="outline" className="gap-2 hover-lift transition-smooth animate-slide-in-left">
                <Info className="w-4 h-4" />
                About
              </Button>
            </Link>
            
            {user && (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" className="gap-2 hover-lift transition-smooth animate-slide-in-left stagger-1">
                    <History className="w-4 h-4" />
                    My History
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" className="gap-2 hover-lift transition-smooth animate-slide-in-left stagger-2">
                    <Activity className="w-4 h-4" />
                    Features
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <ThemeToggle />
            {diseases.length > 0 && (
              <>
                <Button variant="outline" onClick={handleReset} className="gap-2 hover-lift transition-smooth animate-slide-in-right stagger-1">
                  <RotateCcw className="w-4 h-4" />
                  New Analysis
                </Button>
                <Button onClick={handleDownloadPDF} className="gap-2 hover-lift hover-glow transition-smooth animate-slide-in-right stagger-2">
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    if (!lastAssessmentData) {
                      toast.error("No assessment data to share");
                      return;
                    }
                    try {
                      await shareReport({
                        diseases: diseases,
                        safetyResults: safetyResults,
                        symptoms: lastAssessmentData.data.symptoms,
                        allergies: lastAssessmentData.data.allergies,
                        currentMedications: lastAssessmentData.data.currentMeds,
                        date: new Date().toLocaleDateString()
                      });
                      toast.success("Report shared!");
                    } catch (error: any) {
                      toast.error("Failed to share report");
                    }
                  }}
                  className="gap-2 hover-lift transition-smooth animate-slide-in-right stagger-3"
                >
                  <Info className="w-4 h-4" />
                  Share
                </Button>
              </>
            )}
            
            {user ? (
              <Button variant="secondary" onClick={handleSignOut} className="gap-2 hover-lift transition-smooth animate-slide-in-right">
                <User className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="gap-2 animate-pulse-glow hover-lift transition-smooth animate-slide-in-right">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {!user && (
          <div className="mb-6 bg-warning/10 border border-warning rounded-lg p-4 animate-bounce-in hover-lift transition-smooth">
            <p className="text-sm text-warning-foreground">
              <strong>💡 Tip:</strong> Sign in to save your assessments and track your health history over time!
            </p>
          </div>
        )}

        <div className="space-y-8">
          <PredictionForm onSubmit={handlePrediction} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <DocumentAnalyzer 
            onAnalysisComplete={handleDocumentAnalysis}
            allergies={allergies}
            currentMeds={currentMeds}
          />

          {diseases.length > 0 && (
            <div id="results" className="space-y-8 animate-fade-in-scale">
              <ResultsDisplay diseases={diseases} safetyResults={safetyResults} />
              <SafetyChart safetyResults={safetyResults} />
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground pb-8">
          <p className="mb-2">
            ⚠️ <strong>Medical Disclaimer:</strong> This system is for educational purposes only.
          </p>
          <p>
            Always consult qualified healthcare professionals before making any medical decisions.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
