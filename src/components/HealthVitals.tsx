import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface VitalRecord {
  id: string;
  vital_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes: string | null;
}

export const HealthVitals = () => {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vital_type: "blood_pressure",
    value: "",
    unit: "",
    recorded_at: new Date().toISOString().slice(0, 16),
    notes: ""
  });

  const vitalTypes = [
    { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg", defaultUnit: "mmHg" },
    { value: "heart_rate", label: "Heart Rate", unit: "bpm", defaultUnit: "bpm" },
    { value: "temperature", label: "Temperature", unit: "°F", defaultUnit: "°F" },
    { value: "weight", label: "Weight", unit: "lbs", defaultUnit: "lbs" },
    { value: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", defaultUnit: "mg/dL" },
    { value: "oxygen_saturation", label: "Oxygen Saturation", unit: "%", defaultUnit: "%" }
  ];

  useEffect(() => {
    fetchVitals();
    const selectedType = vitalTypes.find(t => t.value === formData.vital_type);
    if (selectedType) {
      setFormData({ ...formData, unit: selectedType.defaultUnit });
    }
  }, []);

  useEffect(() => {
    const selectedType = vitalTypes.find(t => t.value === formData.vital_type);
    if (selectedType) {
      setFormData(prev => ({ ...prev, unit: selectedType.defaultUnit }));
    }
  }, [formData.vital_type]);

  const fetchVitals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_vitals")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setVitals(data || []);
    } catch (error: any) {
      toast.error("Failed to load vitals");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to record vitals");
        return;
      }

      if (!formData.value) {
        toast.error("Please enter a value");
        return;
      }

      const vitalData = {
        user_id: user.id,
        vital_type: formData.vital_type,
        value: parseFloat(formData.value),
        unit: formData.unit,
        recorded_at: new Date(formData.recorded_at).toISOString(),
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from("health_vitals")
        .insert([vitalData]);
      
      if (error) throw error;
      toast.success("Vital recorded");
      setDialogOpen(false);
      resetForm();
      fetchVitals();
    } catch (error: any) {
      toast.error(error.message || "Failed to record vital");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("health_vitals")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Vital deleted");
      fetchVitals();
    } catch (error: any) {
      toast.error("Failed to delete vital");
    }
  };

  const resetForm = () => {
    const selectedType = vitalTypes.find(t => t.value === formData.vital_type);
    setFormData({
      vital_type: "blood_pressure",
      value: "",
      unit: selectedType?.defaultUnit || "",
      recorded_at: new Date().toISOString().slice(0, 16),
      notes: ""
    });
  };

  const getVitalLabel = (type: string) => {
    return vitalTypes.find(t => t.value === type)?.label || type;
  };

  const chartData = vitals
    .filter(v => v.vital_type === formData.vital_type)
    .slice(0, 30)
    .reverse()
    .map(v => ({
      date: format(new Date(v.recorded_at), "MMM d"),
      value: v.value
    }));

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-success/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success" />
              Health Vitals Tracker
            </CardTitle>
            <CardDescription>Track your vital signs over time</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Record Vital
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Health Vital</DialogTitle>
                <DialogDescription>
                  Track your vital signs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Vital Type</Label>
                  <Select value={formData.vital_type} onValueChange={(value) => setFormData({ ...formData, vital_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vitalTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Unit of measurement"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.recorded_at}
                    onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
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
                  Record Vital
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {chartData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-4">
              {vitals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vitals recorded. Record your first vital above.
                </div>
              ) : (
                vitals.slice(0, 20).map((vital) => (
                  <Card key={vital.id} className="border hover-lift transition-smooth">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {getVitalLabel(vital.vital_type)}
                            </h3>
                            <span className="text-2xl font-bold text-success">
                              {vital.value} {vital.unit}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(vital.recorded_at), "PPP 'at' p")}
                          </p>
                          {vital.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{vital.notes}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vital.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

