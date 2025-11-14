import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentAnalyzer } from "@/components/DocumentAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Calendar, TrendingUp, Activity, LogOut, Trash2, User, Edit, Download, Settings, BarChart3, Award, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Disease } from "@/utils/diseasePredictor";
import { MedicineSafety } from "@/utils/safetyChecker";

interface Assessment {
  id: string;
  predicted_disease: string;
  confidence: number;
  symptoms: string[];
  created_at: string;
  recommended_medicines: any;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMeds, setCurrentMeds] = useState<string[]>([]);

  useEffect(() => {
    checkUser();
    fetchAssessments();
    fetchProfile();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setProfileForm({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
        });
      } else {
        // If no profile exists, create one
        setProfileForm({
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSavingProfile(true);
    try {
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profileForm.full_name,
          email: profileForm.email,
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.full_name,
        },
      });

      if (updateError) throw updateError;

      await fetchProfile();
      setEditProfileOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportData = async () => {
    try {
      const dataToExport = {
        profile: profile,
        assessments: assessments,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-data-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error: any) {
      toast.error("Failed to export data");
    }
  };

  const handleDocumentAnalysis = async (data: {
    diseases: Disease[];
    safetyResults: MedicineSafety[];
    analysis: any;
  }) => {
    if (!user) return;

    try {
      if (data.diseases.length > 0) {
        const topDisease = data.diseases[0];
        
        const { error } = await supabase
          .from("assessments")
          .insert([{
            user_id: user.id,
            predicted_disease: topDisease.name,
            confidence: topDisease.confidence,
            symptoms: data.analysis.identifiedSymptoms,
            allergies: allergies,
            current_medications: currentMeds,
            recommended_medicines: data.safetyResults as any,
          }]);

        if (error) throw error;

        // Refresh assessments
        await fetchAssessments();
        
        toast.success("Document analysis saved to your history!");
      }
    } catch (error: any) {
      console.error("Error saving document analysis:", error);
      toast.error("Failed to save document analysis");
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast.error("Failed to load assessment history");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("assessments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAssessments(assessments.filter(a => a.id !== id));
      toast.success("Assessment deleted");
    } catch (error: any) {
      toast.error("Failed to delete assessment");
    }
  };

  const diseaseFrequency = assessments.reduce((acc, curr) => {
    acc[curr.predicted_disease] = (acc[curr.predicted_disease] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonDisease = Object.entries(diseaseFrequency)
    .sort(([, a], [, b]) => b - a)[0];

  const totalSymptoms = assessments.reduce((acc, curr) => acc + curr.symptoms.length, 0);
  const avgConfidence = assessments.length > 0
    ? Math.round(assessments.reduce((acc, curr) => acc + curr.confidence, 0) / assessments.length)
    : 0;
  
  const uniqueDiseases = new Set(assessments.map(a => a.predicted_disease)).size;
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2 hover-lift transition-smooth animate-slide-in-left">
              <ArrowLeft className="w-4 h-4" />
              New Assessment
            </Button>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={handleSignOut} className="gap-2 hover-lift transition-smooth animate-slide-in-right">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
          
          <div className="bg-medical-gradient text-primary-foreground rounded-2xl p-8 shadow-xl animate-gradient">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 animate-slide-in-down">📊 Health Dashboard</h1>
                <p className="text-lg opacity-90 animate-fade-in-scale stagger-1">
                  Welcome back, {profile?.full_name || user?.email?.split("@")[0] || "User"}
                </p>
              </div>
              <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="gap-2 hover-lift transition-smooth">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your personal information and preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={savingProfile}>
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover-lift animate-scale-in">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 border-2 border-primary animate-pulse-glow">
                  <AvatarImage src="" alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{profile?.full_name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since {profile?.created_at ? format(new Date(profile.created_at), "MMM yyyy") : "Recently"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  {assessments.length} total assessments
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover-lift animate-scale-in stagger-1">
            <CardHeader className="bg-secondary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-secondary" />
                Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-3xl font-bold text-secondary">{uniqueDiseases}</p>
                <p className="text-sm text-muted-foreground">Unique conditions tracked</p>
              </div>
              <Separator />
              <div>
                <p className="text-3xl font-bold text-secondary">{avgConfidence}%</p>
                <p className="text-sm text-muted-foreground">Average confidence</p>
              </div>
              <Separator />
              <div>
                <p className="text-3xl font-bold text-secondary">{totalSymptoms}</p>
                <p className="text-sm text-muted-foreground">Total symptoms logged</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover-lift animate-scale-in stagger-2">
            <CardHeader className="bg-accent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 hover-lift transition-smooth" onClick={handleExportData}>
                <Download className="w-4 h-4" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 hover-lift transition-smooth" onClick={() => navigate("/")}>
                <Activity className="w-4 h-4" />
                New Assessment
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 hover-lift transition-smooth" onClick={() => setEditProfileOpen(true)}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 hover-lift transition-smooth" onClick={() => {
                const tabs = document.querySelector('[role="tablist"]');
                const documentTab = document.querySelector('[value="documents"]');
                if (documentTab) (documentTab as HTMLElement).click();
                setTimeout(() => {
                  document.getElementById('document-analyzer')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}>
                <FileText className="w-4 h-4" />
                Analyze Document
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover-lift transition-smooth animate-slide-in-up">
            <CardHeader className="bg-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                Total Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold text-primary animate-bounce-in">{assessments.length}</p>
              <p className="text-sm text-muted-foreground mt-2">All-time predictions</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover-lift transition-smooth animate-slide-in-up stagger-1">
            <CardHeader className="bg-secondary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Most Common
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-secondary">
                {mostCommonDisease ? mostCommonDisease[0] : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {mostCommonDisease ? `${mostCommonDisease[1]} occurrence(s)` : "No data yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover-lift transition-smooth animate-slide-in-up stagger-2">
            <CardHeader className="bg-success/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-success" />
                Last Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-success">
                {assessments[0] ? format(new Date(assessments[0].created_at), "MMM d") : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {assessments[0] ? format(new Date(assessments[0].created_at), "yyyy") : "No assessments yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover-lift transition-smooth animate-slide-in-up stagger-3">
            <CardHeader className="bg-warning/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-warning" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold text-warning animate-bounce-in">
                {assessments.length > 0 ? Math.min(100, Math.round((avgConfidence / 100) * 85 + 15)) : 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Based on assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Assessments and Document Analysis */}
        <Tabs defaultValue="assessments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="assessments" className="gap-2 hover-lift transition-smooth">
              <Activity className="w-4 h-4" />
              Assessment History
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 hover-lift transition-smooth">
              <FileText className="w-4 h-4" />
              Document Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-6">
            <Card className="border-2 shadow-lg hover-lift animate-scale-in">
          <CardHeader className="bg-accent">
                <div className="flex justify-between items-center">
                  <div>
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>View and manage your past health assessments</CardDescription>
                  </div>
                  {assessments.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2 hover-lift transition-smooth">
                      <Download className="w-4 h-4" />
                      Export All
                    </Button>
                  )}
                </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-rotate-slow" />
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
            ) : assessments.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in-scale">
                <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No assessments yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by creating your first health assessment
                </p>
                    <Button onClick={() => navigate("/")} className="hover-lift transition-smooth">
                  Create Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                    {assessments.map((assessment, idx) => (
                      <Card key={assessment.id} className="border hover-lift transition-smooth animate-slide-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {assessment.predicted_disease}
                            </h3>
                                <Badge variant="default" className="animate-pulse-glow">
                              {assessment.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(assessment.created_at), "PPP 'at' p")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(assessment.id)}
                              className="text-destructive hover:text-destructive hover-lift transition-smooth"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold mb-2">Symptoms:</p>
                        <div className="flex flex-wrap gap-2">
                          {assessment.symptoms.map((symptom, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs hover-lift transition-smooth">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div id="document-analyzer">
              <DocumentAnalyzer 
                onAnalysisComplete={handleDocumentAnalysis}
                allergies={allergies}
                currentMeds={currentMeds}
              />
            </div>

            {/* Document Analysis History */}
            {assessments.length > 0 && (
              <Card className="border-2 shadow-lg hover-lift animate-scale-in">
                <CardHeader className="bg-accent">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Document Analyses
                  </CardTitle>
                  <CardDescription>
                    Assessments created from document analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {assessments.slice(0, 5).map((assessment, idx) => (
                      <Card key={assessment.id} className="border hover-lift transition-smooth animate-slide-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{assessment.predicted_disease}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {assessment.confidence}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(assessment.created_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {assessments.length > 5 && (
                      <Button 
                        variant="outline" 
                        className="w-full hover-lift transition-smooth"
                        onClick={() => {
                          const tabs = document.querySelector('[role="tablist"]');
                          const assessmentTab = document.querySelector('[value="assessments"]');
                          if (assessmentTab) (assessmentTab as HTMLElement).click();
                        }}
                      >
                        View All Assessments
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
