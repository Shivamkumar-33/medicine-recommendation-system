import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MedicationReminders } from "@/components/MedicationReminders";
import { FamilyHistory } from "@/components/FamilyHistory";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import { HealthVitals } from "@/components/HealthVitals";
import { Appointments } from "@/components/Appointments";
import { LabResults } from "@/components/LabResults";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { HealthGoals } from "@/components/HealthGoals";
import { ArrowLeft, LogOut, Bell, Users, Phone, Activity, Calendar, FileText, Bot, Target } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export const Features = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Button>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
          
          <div className="bg-medical-gradient text-primary-foreground rounded-2xl p-8 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">🩺 Health Management Features</h1>
            <p className="text-lg opacity-90">
              Comprehensive health tracking and management tools
            </p>
          </div>
        </div>

        {/* Features Tabs */}
        <Tabs defaultValue="reminders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="reminders" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden lg:inline">Reminders</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="vitals" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden lg:inline">Vitals</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="labs" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Labs</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <Bot className="w-4 h-4" />
              <span className="hidden lg:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2" onClick={() => navigate("/dashboard")}>
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reminders">
            <MedicationReminders />
          </TabsContent>

          <TabsContent value="history">
            <FamilyHistory />
          </TabsContent>

          <TabsContent value="contacts">
            <EmergencyContacts />
          </TabsContent>

          <TabsContent value="vitals">
            <HealthVitals />
          </TabsContent>

          <TabsContent value="appointments">
            <Appointments />
          </TabsContent>

          <TabsContent value="labs">
            <LabResults />
          </TabsContent>

          <TabsContent value="chat">
            <AIChatAssistant />
          </TabsContent>

          <TabsContent value="goals">
            <HealthGoals />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Features;

