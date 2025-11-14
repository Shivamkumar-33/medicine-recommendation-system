import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Trash2, Edit, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Appointment {
  id: string;
  doctor_name: string;
  specialty: string | null;
  appointment_date: string;
  location: string | null;
  notes: string | null;
}

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    doctor_name: "",
    specialty: "",
    appointment_date: new Date().toISOString().slice(0, 16),
    location: "",
    notes: ""
  });

  useEffect(() => {
    fetchAppointments();
    checkUpcomingAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingAppointments = () => {
    const now = new Date();
    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointment_date);
      const hoursUntil = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntil > 0 && hoursUntil <= 24 && !apt.reminder_sent) {
        toast.info(`Upcoming appointment: ${apt.doctor_name}`, {
          description: `On ${format(aptDate, "MMM d, yyyy 'at' p")}`,
          duration: 10000
        });
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save appointments");
        return;
      }

      if (!formData.doctor_name || !formData.appointment_date) {
        toast.error("Doctor name and appointment date are required");
        return;
      }

      const appointmentData = {
        user_id: user.id,
        doctor_name: formData.doctor_name,
        specialty: formData.specialty || null,
        appointment_date: new Date(formData.appointment_date).toISOString(),
        location: formData.location || null,
        notes: formData.notes || null
      };

      if (editingAppointment) {
        const { error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", editingAppointment.id);
        
        if (error) throw error;
        toast.success("Appointment updated");
      } else {
        const { error } = await supabase
          .from("appointments")
          .insert([appointmentData]);
        
        if (error) throw error;
        toast.success("Appointment scheduled");
      }

      setDialogOpen(false);
      resetForm();
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.message || "Failed to save appointment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Appointment deleted");
      fetchAppointments();
    } catch (error: any) {
      toast.error("Failed to delete appointment");
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      doctor_name: appointment.doctor_name,
      specialty: appointment.specialty || "",
      appointment_date: new Date(appointment.appointment_date).toISOString().slice(0, 16),
      location: appointment.location || "",
      notes: appointment.notes || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      doctor_name: "",
      specialty: "",
      appointment_date: new Date().toISOString().slice(0, 16),
      location: "",
      notes: ""
    });
    setEditingAppointment(null);
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) >= new Date()
  );
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) < new Date()
  );

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-warning/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warning" />
              Appointments
            </CardTitle>
            <CardDescription>Schedule and manage your medical appointments</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAppointment ? "Edit" : "Schedule"} Appointment</DialogTitle>
                <DialogDescription>
                  Add a new medical appointment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Doctor Name *</Label>
                  <Input
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g., Cardiology, General Practice"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Clinic address"
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
                  {editingAppointment ? "Update" : "Schedule"} Appointment
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
            {upcomingAppointments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Upcoming Appointments</h3>
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <Card key={apt.id} className="border hover-lift transition-smooth">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{apt.doctor_name}</h3>
                              {apt.specialty && (
                                <span className="text-sm text-muted-foreground">({apt.specialty})</span>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {format(new Date(apt.appointment_date), "PPP 'at' p")}
                              </div>
                              {apt.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  {apt.location}
                                </div>
                              )}
                              {apt.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{apt.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(apt)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {pastAppointments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Past Appointments</h3>
                <div className="space-y-4">
                  {pastAppointments.slice(0, 10).map((apt) => (
                    <Card key={apt.id} className="border opacity-75 hover-lift transition-smooth">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{apt.doctor_name}</h3>
                              {apt.specialty && (
                                <span className="text-sm text-muted-foreground">({apt.specialty})</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.appointment_date), "PPP 'at' p")}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {appointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No appointments scheduled. Schedule your first appointment above.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

