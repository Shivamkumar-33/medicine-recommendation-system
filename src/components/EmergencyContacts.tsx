import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Phone, Plus, Trash2, Edit, Star, Mail } from "lucide-react";
import { toast } from "sonner";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  is_primary: boolean;
  notes: string | null;
}

export const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    is_primary: false,
    notes: ""
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .order("is_primary", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast.error("Failed to load emergency contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save contacts");
        return;
      }

      if (!formData.name || !formData.phone) {
        toast.error("Name and phone are required");
        return;
      }

      // If setting as primary, unset other primary contacts
      if (formData.is_primary) {
        await supabase
          .from("emergency_contacts")
          .update({ is_primary: false })
          .eq("user_id", user.id)
          .eq("is_primary", true);
      }

      const contactData = {
        user_id: user.id,
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email || null,
        is_primary: formData.is_primary,
        notes: formData.notes || null
      };

      if (editingContact) {
        const { error } = await supabase
          .from("emergency_contacts")
          .update(contactData)
          .eq("id", editingContact.id);
        
        if (error) throw error;
        toast.success("Contact updated");
      } else {
        const { error } = await supabase
          .from("emergency_contacts")
          .insert([contactData]);
        
        if (error) throw error;
        toast.success("Contact added");
      }

      setDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error: any) {
      toast.error(error.message || "Failed to save contact");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Contact deleted");
      fetchContacts();
    } catch (error: any) {
      toast.error("Failed to delete contact");
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || "",
      is_primary: contact.is_primary,
      notes: contact.notes || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      relationship: "",
      phone: "",
      email: "",
      is_primary: false,
      notes: ""
    });
    setEditingContact(null);
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-destructive/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-destructive" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>Manage your emergency contacts</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingContact ? "Edit" : "Add"} Emergency Contact</DialogTitle>
                <DialogDescription>
                  Add someone to contact in case of emergency
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                  />
                  <Label>Set as primary contact</Label>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingContact ? "Update" : "Add"} Contact
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No emergency contacts. Add your first contact above.
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="border hover-lift transition-smooth">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{contact.name}</h3>
                        {contact.is_primary && (
                          <Badge variant="default" className="gap-1">
                            <Star className="w-3 h-3" />
                            Primary
                          </Badge>
                        )}
                        {contact.relationship && (
                          <Badge variant="outline">{contact.relationship}</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                            {contact.phone}
                          </a>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{contact.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
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

