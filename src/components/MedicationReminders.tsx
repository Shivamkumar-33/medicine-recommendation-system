import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Clock, Trash2, Edit, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface MedicationReminder {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
}

export const MedicationReminders = () => {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MedicationReminder | null>(null);
  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    frequency: "daily",
    times: [] as string[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    is_active: true,
    notes: ""
  });

  useEffect(() => {
    fetchReminders();
    checkUpcomingReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("medication_reminders")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (error: any) {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingReminders = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    reminders.forEach(reminder => {
      if (!reminder.is_active) return;
      
      reminder.times.forEach(time => {
        const [hour, minute] = time.split(':').map(Number);
        if (hour === currentHour && Math.abs(minute - currentMinute) < 5) {
          toast.info(`Time to take ${reminder.medication_name}`, {
            description: `Dosage: ${reminder.dosage}`,
            duration: 10000
          });
        }
      });
    });
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to use reminders");
        return;
      }

      if (formData.times.length === 0) {
        toast.error("Please add at least one reminder time");
        return;
      }

      const reminderData = {
        user_id: user.id,
        medication_name: formData.medication_name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        notes: formData.notes || null
      };

      if (editingReminder) {
        const { error } = await supabase
          .from("medication_reminders")
          .update(reminderData)
          .eq("id", editingReminder.id);
        
        if (error) throw error;
        toast.success("Reminder updated");
      } else {
        const { error } = await supabase
          .from("medication_reminders")
          .insert([reminderData]);
        
        if (error) throw error;
        toast.success("Reminder created");
      }

      setDialogOpen(false);
      resetForm();
      fetchReminders();
    } catch (error: any) {
      toast.error(error.message || "Failed to save reminder");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medication_reminders")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Reminder deleted");
      fetchReminders();
    } catch (error: any) {
      toast.error("Failed to delete reminder");
    }
  };

  const handleEdit = (reminder: MedicationReminder) => {
    setEditingReminder(reminder);
    setFormData({
      medication_name: reminder.medication_name,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      times: reminder.times,
      start_date: reminder.start_date,
      end_date: reminder.end_date || "",
      is_active: reminder.is_active,
      notes: reminder.notes || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      medication_name: "",
      dosage: "",
      frequency: "daily",
      times: [],
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      is_active: true,
      notes: ""
    });
    setEditingReminder(null);
  };

  const addTime = () => {
    const time = prompt("Enter time (HH:MM format, e.g., 09:00):");
    if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      setFormData({ ...formData, times: [...formData.times, time] });
    } else if (time) {
      toast.error("Invalid time format. Use HH:MM (e.g., 09:00)");
    }
  };

  const removeTime = (time: string) => {
    setFormData({ ...formData, times: formData.times.filter(t => t !== time) });
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-primary/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Medication Reminders
            </CardTitle>
            <CardDescription>Set reminders for your medications</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingReminder ? "Edit" : "Add"} Medication Reminder</DialogTitle>
                <DialogDescription>
                  Set up reminders for your medications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Medication Name</Label>
                  <Input
                    value={formData.medication_name}
                    onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                    placeholder="e.g., Paracetamol"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice_daily">Twice Daily</SelectItem>
                      <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reminder Times</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.times.map((time, idx) => (
                      <Badge key={idx} variant="outline" className="gap-2">
                        <Clock className="w-3 h-3" />
                        {time}
                        <button onClick={() => removeTime(time)} className="ml-1">×</button>
                      </Badge>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addTime} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Time
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
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
                  {editingReminder ? "Update" : "Create"} Reminder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reminders set. Create your first reminder above.
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="border hover-lift transition-smooth">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{reminder.medication_name}</h3>
                        {reminder.is_active ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Dosage: {reminder.dosage} | Frequency: {reminder.frequency}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {reminder.times.map((time, idx) => (
                          <Badge key={idx} variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {time}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Start: {format(new Date(reminder.start_date), "MMM d, yyyy")}
                        {reminder.end_date && ` | End: ${format(new Date(reminder.end_date), "MMM d, yyyy")}`}
                      </p>
                      {reminder.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{reminder.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(reminder)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
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

