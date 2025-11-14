import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Brain, Database, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 text-foreground">
            About This System
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-Powered Medical Recommendation Platform
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. Symptom Analysis</h3>
                <p className="text-muted-foreground">
                  Our system uses a sophisticated pattern-matching algorithm inspired by Random Forest classification. 
                  It analyzes your selected symptoms against a comprehensive medical database containing 10+ common conditions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2. Disease Prediction</h3>
                <p className="text-muted-foreground">
                  Each symptom combination is scored based on confidence levels, providing you with the most likely 
                  diagnosis along with alternative possibilities. The prediction model considers symptom correlations 
                  and medical prevalence data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3. Safety Validation</h3>
                <p className="text-muted-foreground">
                  Before recommending medications, the system performs comprehensive safety checks including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Allergy screening against known patient allergies</li>
                  <li>Drug-drug interaction analysis with current medications</li>
                  <li>Contraindication checking based on medical conditions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-secondary text-secondary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Sources & Datasets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <p className="text-muted-foreground mb-4">
                This system integrates multiple medical databases to provide accurate recommendations:
              </p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">Dataset</Badge>
                  <div>
                    <p className="font-semibold">Disease-Symptom Database</p>
                    <p className="text-sm text-muted-foreground">10 conditions, 50+ unique symptoms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">Dataset</Badge>
                  <div>
                    <p className="font-semibold">Medication Information</p>
                    <p className="text-sm text-muted-foreground">35+ generic medicines with pricing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">Dataset</Badge>
                  <div>
                    <p className="font-semibold">Drug Interactions Database</p>
                    <p className="text-sm text-muted-foreground">Common DDI pairs and contraindications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Badge variant="outline">Dataset</Badge>
                  <div>
                    <p className="font-semibold">Dietary & Precautions</p>
                    <p className="text-sm text-muted-foreground">Evidence-based lifestyle recommendations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-accent">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Multi-symptom Analysis</p>
                    <p className="text-sm text-muted-foreground">Analyze multiple symptoms simultaneously</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Allergy Detection</p>
                    <p className="text-sm text-muted-foreground">Automatic screening for known allergies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Drug Interaction Checker</p>
                    <p className="text-sm text-muted-foreground">Identifies harmful drug combinations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Price Transparency</p>
                    <p className="text-sm text-muted-foreground">Generic medicine cost comparison</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Diet Recommendations</p>
                    <p className="text-sm text-muted-foreground">Condition-specific dietary advice</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Visual Analytics</p>
                    <p className="text-sm text-muted-foreground">Safety statistics and charts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-warning shadow-lg">
            <CardHeader className="bg-warning/20">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="font-semibold text-destructive mb-2">⚠️ Not a Substitute for Professional Medical Advice</p>
                <p className="text-sm text-muted-foreground">
                  This system is designed for educational and informational purposes only. It should NOT be used as a 
                  replacement for professional medical diagnosis, treatment, or advice.
                </p>
              </div>
              <div className="bg-warning/10 border border-warning rounded-lg p-4">
                <p className="font-semibold text-warning mb-2">⚠️ Always Consult Healthcare Professionals</p>
                <p className="text-sm text-muted-foreground">
                  Before starting, stopping, or changing any medication or treatment plan, always consult with a 
                  qualified healthcare provider who can assess your individual medical situation.
                </p>
              </div>
              <div className="bg-primary/10 border border-primary rounded-lg p-4">
                <p className="font-semibold text-primary mb-2">ℹ️ Emergency Situations</p>
                <p className="text-sm text-muted-foreground">
                  In case of medical emergencies, call emergency services immediately. Do not rely on this system 
                  for urgent medical conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button size="lg" className="gap-2">
              Start Your Assessment
              <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
