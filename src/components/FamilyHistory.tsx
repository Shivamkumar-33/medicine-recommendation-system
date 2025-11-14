import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface FamilyHistoryItem {
  id: string;
  relation: string;
  condition_name: string;
  age_at_diagnosis: number | null;
  notes: string | null;
}

export const FamilyHistory = () => {
  const [history, setHistory] = useState<FamilyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FamilyHistoryItem | null>(null);
  const [formData, setFormData] = useState({
    relation: "",
    condition_name: "",
    age_at_diagnosis: "",
    notes: ""
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("family_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast.error("Failed to load family history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save family history");
        return;
      }

      if (!formData.relation || !formData.condition_name) {
        toast.error("Please fill in all required fields");
        return;
      }

      const historyData = {
        user_id: user.id,
        relation: formData.relation,
        condition_name: formData.condition_name,
        age_at_diagnosis: formData.age_at_diagnosis ? parseInt(formData.age_at_diagnosis) : null,
        notes: formData.notes || null
      };

      if (editingItem) {
        const { error } = await supabase
          .from("family_history")
          .update(historyData)
          .eq("id", editingItem.id);
        
        if (error) throw error;
        toast.success("Family history updated");
      } else {
        const { error } = await supabase
          .from("family_history")
          .insert([historyData]);
        
        if (error) throw error;
        toast.success("Family history added");
      }

      setDialogOpen(false);
      resetForm();
      fetchHistory();
    } catch (error: any) {
      toast.error(error.message || "Failed to save family history");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("family_history")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Family history deleted");
      fetchHistory();
    } catch (error: any) {
      toast.error("Failed to delete family history");
    }
  };

  const handleEdit = (item: FamilyHistoryItem) => {
    setEditingItem(item);
    setFormData({
      relation: item.relation,
      condition_name: item.condition_name,
      age_at_diagnosis: item.age_at_diagnosis?.toString() || "",
      notes: item.notes || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      relation: "",
      condition_name: "",
      age_at_diagnosis: "",
      notes: ""
    });
    setEditingItem(null);
  };

  const relations = [
    "Mother", "Father", "Sister", "Brother", "Maternal Grandmother",
    "Maternal Grandfather", "Paternal Grandmother", "Paternal Grandfather",
    "Aunt", "Uncle", "Cousin", "Other"
  ];

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-secondary/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Family Medical History
            </CardTitle>
            <CardDescription>Track medical conditions in your family</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit" : "Add"} Family History</DialogTitle>
                <DialogDescription>
                  Record medical conditions in your family
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Relation *</Label>
                  <Select value={formData.relation} onValueChange={(value) => setFormData({ ...formData, relation: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {relations.map(rel => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition Name *</Label>
                  <Input
                    value={formData.condition_name}
                    onChange={(e) => setFormData({ ...formData, condition_name: e.target.value })}
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age at Diagnosis (Optional)</Label>
                  <Input
                    type="number"
                    value={formData.age_at_diagnosis}
                    onChange={(e) => setFormData({ ...formData, age_at_diagnosis: e.target.value })}
                    placeholder="e.g., 45"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
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
                  {editingItem ? "Update" : "Add"} History
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No family history recorded. Add your first entry above.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="border hover-lift transition-smooth">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.condition_name}</h3>
                        <Badge variant="outline">{item.relation}</Badge>
                      </div>
                      {item.age_at_diagnosis && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Diagnosed at age {item.age_at_diagnosis}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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

