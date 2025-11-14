import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, Sparkles, CheckCircle, AlertTriangle, FileCheck, Loader2 } from "lucide-react";
import { analyzeDocument, DocumentAnalysis, ExtractedKeyword } from "@/utils/documentAnalyzer";
import { toast } from "sonner";
import { predictDisease, Disease } from "@/utils/diseasePredictor";
import { checkMedicineSafety, MedicineSafety } from "@/utils/safetyChecker";

interface DocumentAnalyzerProps {
  onAnalysisComplete?: (data: {
    diseases: Disease[];
    safetyResults: MedicineSafety[];
    analysis: DocumentAnalysis;
  }) => void;
  allergies?: string[];
  currentMeds?: string[];
}

export const DocumentAnalyzer = ({ 
  onAnalysisComplete, 
  allergies = [], 
  currentMeds = [] 
}: DocumentAnalyzerProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [safetyResults, setSafetyResults] = useState<MedicineSafety[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setAnalysis(null);
      setDiseases([]);
      setSafetyResults([]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
    setDiseases([]);
    setSafetyResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    try {
      // Analyze document
      const docAnalysis = await analyzeDocument(file);
      setAnalysis(docAnalysis);

      // If symptoms found, predict diseases
      let predictions: Disease[] = [];
      let safety: MedicineSafety[] = [];
      
      if (docAnalysis.identifiedSymptoms.length > 0) {
        predictions = predictDisease(docAnalysis.identifiedSymptoms);
        setDiseases(predictions);

        // Check medicine safety if diseases found
        if (predictions.length > 0) {
          const topDisease = predictions[0];
          safety = checkMedicineSafety(
            topDisease.medicines,
            allergies,
            currentMeds
          );
          setSafetyResults(safety);
        }
      }

      // Notify parent component
      if (onAnalysisComplete && predictions.length > 0) {
        onAnalysisComplete({
          diseases: predictions,
          safetyResults: safety,
          analysis: docAnalysis
        });
      }

      toast.success("Document analyzed successfully!", {
        description: `Found ${docAnalysis.keywords.length} medical keywords`
      });
    } catch (error: any) {
      toast.error("Failed to analyze document", {
        description: error.message || "Please try again"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'symptom': return 'bg-primary';
      case 'disease': return 'bg-destructive';
      case 'medication': return 'bg-secondary';
      case 'test': return 'bg-warning';
      case 'vital': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'symptom': return '🩺';
      case 'disease': return '🏥';
      case 'medication': return '💊';
      case 'test': return '🔬';
      case 'vital': return '📊';
      default: return '📄';
    }
  };

  return (
    <Card className="border-2 shadow-lg hover-lift animate-scale-in">
      <CardHeader className="bg-accent">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Document Analysis
        </CardTitle>
        <CardDescription>
          Upload medical reports, lab results, or patient documents for AI-powered analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover-lift transition-smooth">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-float-slow" />
              <p className="text-lg font-semibold mb-2">
                {file ? file.name : "Click to upload document"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: .txt, .pdf (Max 10MB)
              </p>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg animate-slide-in-up">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="hover-lift transition-smooth"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className="w-full py-6 text-lg font-semibold hover-lift hover-glow transition-smooth"
            size="lg"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 animate-fade-in-scale">
            {/* Summary */}
            <Alert className="border-primary bg-primary/10">
              <FileText className="w-4 h-4 text-primary" />
              <AlertDescription>
                <strong>Analysis Summary:</strong> {analysis.summary}
              </AlertDescription>
            </Alert>

            {/* Extracted Keywords */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
                Extracted Medical Keywords ({analysis.keywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.slice(0, 20).map((keyword, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className={`hover-lift transition-smooth ${getCategoryColor(keyword.category)}/10 border-${keyword.category === 'symptom' ? 'primary' : keyword.category === 'disease' ? 'destructive' : keyword.category === 'medication' ? 'secondary' : 'muted'}`}
                    title={keyword.context}
                  >
                    {getCategoryIcon(keyword.category)} {keyword.keyword}
                  </Badge>
                ))}
                {analysis.keywords.length > 20 && (
                  <Badge variant="outline" className="text-muted-foreground">
                    +{analysis.keywords.length - 20} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Categories Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.identifiedSymptoms.length > 0 && (
                <Card className="border-2 hover-lift transition-smooth animate-slide-in-left">
                  <CardHeader className="bg-primary/10 pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      🩺 Symptoms ({analysis.identifiedSymptoms.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="flex flex-wrap gap-2">
                      {analysis.identifiedSymptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.identifiedMedications.length > 0 && (
                <Card className="border-2 hover-lift transition-smooth animate-slide-in-right">
                  <CardHeader className="bg-secondary/10 pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      💊 Medications ({analysis.identifiedMedications.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="flex flex-wrap gap-2">
                      {analysis.identifiedMedications.map((med, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.identifiedDiseases.length > 0 && (
                <Card className="border-2 hover-lift transition-smooth animate-slide-in-left stagger-1">
                  <CardHeader className="bg-destructive/10 pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      🏥 Conditions ({analysis.identifiedDiseases.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="flex flex-wrap gap-2">
                      {analysis.identifiedDiseases.map((disease, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {Object.keys(analysis.vitalSigns).length > 0 && (
                <Card className="border-2 hover-lift transition-smooth animate-slide-in-right stagger-1">
                  <CardHeader className="bg-success/10 pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      📊 Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="space-y-2">
                      {Object.entries(analysis.vitalSigns).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {key.replace('_', ' ')}:
                          </span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Disease Predictions */}
            {diseases.length > 0 && (
              <Card className="border-2 border-primary shadow-lg hover-lift animate-bounce-in">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Predicted Conditions Based on Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {diseases.slice(0, 3).map((disease, idx) => (
                    <div key={idx} className="space-y-2 animate-fade-in-scale" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">{disease.name}</h4>
                        <Badge variant="default" className="animate-pulse-glow">
                          {disease.confidence}% match
                        </Badge>
                      </div>
                      <Progress value={disease.confidence} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Safety Results */}
            {safetyResults.length > 0 && (
              <Card className="border-2 shadow-lg hover-lift animate-slide-in-up">
                <CardHeader className="bg-accent">
                  <CardTitle className="flex items-center gap-2">
                    💊 Medication Safety Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {safetyResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-smooth hover-lift ${
                          result.isSafe ? 'bg-success/5 border-success' : 'bg-destructive/5 border-destructive'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {result.isSafe ? (
                              <CheckCircle className="w-5 h-5 text-success animate-pulse-glow-success" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-destructive animate-wiggle" />
                            )}
                            <span className="font-medium">{result.medicine}</span>
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {result.reason}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

