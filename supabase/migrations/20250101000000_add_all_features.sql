-- Migration for all new features

-- Medication Reminders Table
CREATE TABLE IF NOT EXISTS public.medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Medical History Table
CREATE TABLE IF NOT EXISTS public.family_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  condition_name TEXT NOT NULL,
  age_at_diagnosis INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results Table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  results JSONB NOT NULL,
  doctor_name TEXT,
  lab_name TEXT,
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Dosage Tracker Table
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  was_taken BOOLEAN DEFAULT true,
  side_effects TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side Effects Reporting Table
CREATE TABLE IF NOT EXISTS public.side_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  side_effect TEXT NOT NULL,
  severity TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  specialty TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Vitals Table
CREATE TABLE IF NOT EXISTS public.health_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vital_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor/Provider Directory Table
CREATE TABLE IF NOT EXISTS public.healthcare_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  quantity INTEGER,
  refills_remaining INTEGER DEFAULT 0,
  prescribed_date DATE NOT NULL,
  expiry_date DATE,
  doctor_name TEXT,
  pharmacy TEXT,
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Goals Table
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC,
  target_date DATE,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptom Timeline Table
CREATE TABLE IF NOT EXISTS public.symptom_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom TEXT NOT NULL,
  severity INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (users can only access their own data)
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'medication_reminders',
    'family_history',
    'lab_results',
    'emergency_contacts',
    'medication_logs',
    'side_effects',
    'appointments',
    'health_vitals',
    'healthcare_providers',
    'prescriptions',
    'health_goals',
    'symptom_timeline',
    'notifications'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('
      CREATE POLICY "Users can view own %I"
        ON public.%I FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert own %I"
        ON public.%I FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own %I"
        ON public.%I FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete own %I"
        ON public.%I FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    ', table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medication_reminders_user_id ON public.medication_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_active ON public.medication_reminders(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_family_history_user_id ON public.family_history(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON public.lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_date ON public.lab_results(user_id, test_date DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON public.medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_date ON public.medication_logs(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_side_effects_user_id ON public.side_effects(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(user_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_health_vitals_user_id ON public.health_vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_vitals_type_date ON public.health_vitals(user_id, vital_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_user_id ON public.healthcare_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON public.health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_timeline_user_id ON public.symptom_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_timeline_date ON public.symptom_timeline(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

