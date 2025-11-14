import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, Trash2, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface LabResult {
  id: string;
  test_name: string;
  test_date: string;
  results: any;
  doctor_name: string | null;
  lab_name: string | null;
  notes: string | null;
  file_url: string | null;
}

export const LabResults = () => {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    test_name: "",
    test_date: new Date().toISOString().split('T')[0],
    results: "",
    doctor_name: "",
    lab_name: "",
    notes: ""
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("lab_results")
        .select("*")
        .order("test_date", { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      toast.error("Failed to load lab results");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save lab results");
        return;
      }

      if (!formData.test_name || !formData.test_date) {
        toast.error("Test name and date are required");
        return;
      }

      let parsedResults;
      try {
        parsedResults = JSON.parse(formData.results || "{}");
      } catch {
        parsedResults = { value: formData.results };
      }

      const resultData = {
        user_id: user.id,
        test_name: formData.test_name,
        test_date: formData.test_date,
        results: parsedResults,
        doctor_name: formData.doctor_name || null,
        lab_name: formData.lab_name || null,
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from("lab_results")
        .insert([resultData]);
      
      if (error) throw error;
      toast.success("Lab result saved");
      setDialogOpen(false);
      resetForm();
      fetchResults();
    } catch (error: any) {
      toast.error(error.message || "Failed to save lab result");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lab_results")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Lab result deleted");
      fetchResults();
    } catch (error: any) {
      toast.error("Failed to delete lab result");
    }
  };

  const resetForm = () => {
    setFormData({
      test_name: "",
      test_date: new Date().toISOString().split('T')[0],
      results: "",
      doctor_name: "",
      lab_name: "",
      notes: ""
    });
  };

  const renderResults = (resultsData: any) => {
    if (typeof resultsData === 'object' && resultsData !== null) {
      return Object.entries(resultsData).map(([key, value]) => (
        <div key={key} className="flex justify-between py-1">
          <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
          <span className="font-semibold">{String(value)}</span>
        </div>
      ));
    }
    return <span>{String(resultsData)}</span>;
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-primary/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Lab Results
            </CardTitle>
            <CardDescription>Track your laboratory test results</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Lab Result</DialogTitle>
                <DialogDescription>
                  Record your laboratory test results
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Test Name *</Label>
                  <Input
                    value={formData.test_name}
                    onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                    placeholder="e.g., Complete Blood Count, Lipid Panel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Date *</Label>
                  <Input
                    type="date"
                    value={formData.test_date}
                    onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Results (JSON format or plain text)</Label>
                  <Input
                    value={formData.results}
                    onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                    placeholder='{"glucose": 95, "cholesterol": 180} or plain text'
                  />
                </div>
                <div className="space-y-2">
                  <Label>Doctor Name</Label>
                  <Input
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    placeholder="Dr. Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lab Name</Label>
                  <Input
                    value={formData.lab_name}
                    onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                    placeholder="Lab name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Save Result
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No lab results recorded. Add your first result above.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="border hover-lift transition-smooth">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{result.test_name}</h3>
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(result.test_date), "MMM d, yyyy")}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-2">
                        {renderResults(result.results)}
                      </div>
                      {result.doctor_name && (
                        <p className="text-sm text-muted-foreground">Doctor: {result.doctor_name}</p>
                      )}
                      {result.lab_name && (
                        <p className="text-sm text-muted-foreground">Lab: {result.lab_name}</p>
                      )}
                      {result.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{result.notes}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(result.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

