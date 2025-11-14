import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Disease, diseaseInfo } from "@/utils/diseasePredictor";
import { MedicineSafety } from "@/utils/safetyChecker";
import { AlertTriangle, CheckCircle, Info, UtensilsCrossed, ShieldCheck } from "lucide-react";

interface ResultsDisplayProps {
  diseases: Disease[];
  safetyResults: MedicineSafety[];
}

export const ResultsDisplay = ({ diseases, safetyResults }: ResultsDisplayProps) => {
  if (diseases.length === 0) return null;

  const topDisease = diseases[0];
  const info = diseaseInfo[topDisease.name];

  return (
    <div className="space-y-6">
      {/* Predicted Disease */}
      <Card className="border-2 border-primary shadow-lg hover-lift animate-bounce-in">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Predicted Condition
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold text-foreground">{topDisease.name}</h3>
              <Badge variant="default" className="text-lg px-4 py-1 animate-pulse-glow">
                {topDisease.confidence}% Match
              </Badge>
            </div>
            <Progress value={topDisease.confidence} className="h-3" />
          </div>
          
          {info && (
            <p className="text-muted-foreground">{info.description}</p>
          )}

          {diseases.length > 1 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-2">Other Possibilities:</p>
              <div className="flex flex-wrap gap-2">
                {diseases.slice(1, 4).map((d, idx) => (
                  <Badge key={d.name} variant="secondary" className="hover-lift transition-smooth" style={{ animationDelay: `${idx * 0.1}s` }}>
                    {d.name} ({d.confidence}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicine Safety Table */}
      <Card className="border-2 shadow-lg hover-lift animate-slide-in-up stagger-1">
        <CardHeader className="bg-accent">
          <CardTitle className="flex items-center gap-2">
            💊 Recommended Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-4 font-semibold">Medicine</th>
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Safety Info</th>
                  <th className="text-right py-3 px-4 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {safetyResults.map((result, idx) => (
                  <tr
                    key={idx}
                    className={`border-b hover:bg-muted/50 transition-smooth hover-lift ${
                      result.isSafe ? 'bg-success/5' : 'bg-destructive/5'
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="py-4 px-4 font-medium">{result.medicine}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-xs">
                        {result.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {result.isSafe ? (
                        <CheckCircle className="w-5 h-5 text-success animate-pulse-glow-success" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-destructive animate-wiggle" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm">{result.reason}</td>
                    <td className="py-4 px-4 text-right font-semibold">
                      ${result.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Alert className="mt-4 border-warning bg-warning/10">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> This is for educational purposes only. Always consult a healthcare professional before taking any medication.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Diet & Precautions */}
      {info && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 shadow-lg hover-lift animate-slide-in-left stagger-2">
            <CardHeader className="bg-secondary text-secondary-foreground">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 animate-float-slow" />
                Recommended Diet
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {info.diet.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 animate-fade-in-scale transition-smooth" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 animate-pulse-glow-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover-lift animate-slide-in-right stagger-3">
            <CardHeader className="bg-warning/20">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 animate-float-slow" />
                Precautions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {info.precautions.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 animate-fade-in-scale transition-smooth" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 animate-wiggle" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
