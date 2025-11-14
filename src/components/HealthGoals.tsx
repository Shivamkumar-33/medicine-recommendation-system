import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Trash2, Edit, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface HealthGoal {
  id: string;
  goal_name: string;
  goal_type: string;
  target_value: number | null;
  current_value: number | null;
  target_date: string | null;
  is_completed: boolean;
  notes: string | null;
}

export const HealthGoals = () => {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [formData, setFormData] = useState({
    goal_name: "",
    goal_type: "weight_loss",
    target_value: "",
    current_value: "",
    target_date: "",
    notes: ""
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save goals");
        return;
      }

      if (!formData.goal_name) {
        toast.error("Goal name is required");
        return;
      }

      const goalData = {
        user_id: user.id,
        goal_name: formData.goal_name,
        goal_type: formData.goal_type,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        current_value: formData.current_value ? parseFloat(formData.current_value) : null,
        target_date: formData.target_date || null,
        notes: formData.notes || null
      };

      if (editingGoal) {
        const { error } = await supabase
          .from("health_goals")
          .update(goalData)
          .eq("id", editingGoal.id);
        
        if (error) throw error;
        toast.success("Goal updated");
      } else {
        const { error } = await supabase
          .from("health_goals")
          .insert([goalData]);
        
        if (error) throw error;
        toast.success("Goal created");
      }

      setDialogOpen(false);
      resetForm();
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message || "Failed to save goal");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("health_goals")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Goal deleted");
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to delete goal");
    }
  };

  const handleComplete = async (goal: HealthGoal) => {
    try {
      const { error } = await supabase
        .from("health_goals")
        .update({ is_completed: !goal.is_completed })
        .eq("id", goal.id);
      
      if (error) throw error;
      toast.success(goal.is_completed ? "Goal marked as incomplete" : "Goal completed!");
      fetchGoals();
    } catch (error: any) {
      toast.error("Failed to update goal");
    }
  };

  const handleEdit = (goal: HealthGoal) => {
    setEditingGoal(goal);
    setFormData({
      goal_name: goal.goal_name,
      goal_type: goal.goal_type,
      target_value: goal.target_value?.toString() || "",
      current_value: goal.current_value?.toString() || "",
      target_date: goal.target_date || "",
      notes: goal.notes || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      goal_name: "",
      goal_type: "weight_loss",
      target_value: "",
      current_value: "",
      target_date: "",
      notes: ""
    });
    setEditingGoal(null);
  };

  const calculateProgress = (goal: HealthGoal): number => {
    if (!goal.target_value || !goal.current_value) return 0;
    if (goal.target_value === 0) return 0;
    return Math.min(100, Math.max(0, (goal.current_value / goal.target_value) * 100));
  };

  const goalTypes = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "weight_gain", label: "Weight Gain" },
    { value: "exercise", label: "Exercise" },
    { value: "medication_adherence", label: "Medication Adherence" },
    { value: "blood_pressure", label: "Blood Pressure" },
    { value: "blood_sugar", label: "Blood Sugar" },
    { value: "other", label: "Other" }
  ];

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-accent">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Health Goals
            </CardTitle>
            <CardDescription>Set and track your health goals</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit" : "Create"} Health Goal</DialogTitle>
                <DialogDescription>
                  Set a health goal and track your progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Goal Name *</Label>
                  <Input
                    value={formData.goal_name}
                    onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                    placeholder="e.g., Lose 20 pounds"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <Select value={formData.goal_type} onValueChange={(value) => setFormData({ ...formData, goal_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {goalTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Value</Label>
                  <Input
                    type="number"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    placeholder="Current value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="Target value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
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
                  {editingGoal ? "Update" : "Create"} Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No goals set. Create your first health goal above.
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = calculateProgress(goal);
              return (
                <Card key={goal.id} className={`border hover-lift transition-smooth ${goal.is_completed ? 'opacity-75' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{goal.goal_name}</h3>
                          {goal.is_completed ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline">{goal.goal_type.replace('_', ' ')}</Badge>
                          )}
                        </div>
                        {goal.current_value !== null && goal.target_value !== null && (
                          <div className="space-y-2 mb-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress: {goal.current_value} / {goal.target_value}</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        {goal.target_date && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Target date: {format(new Date(goal.target_date), "MMM d, yyyy")}
                          </p>
                        )}
                        {goal.notes && (
                          <p className="text-sm text-muted-foreground">{goal.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleComplete(goal)}>
                          <CheckCircle2 className={`w-4 h-4 ${goal.is_completed ? 'text-success' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

