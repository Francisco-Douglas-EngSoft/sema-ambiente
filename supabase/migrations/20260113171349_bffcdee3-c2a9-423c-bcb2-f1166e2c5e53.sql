-- Training table
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('course', 'workshop', 'certification', 'webinar')),
  instructor TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  duration_hours INTEGER,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training participants
CREATE TABLE public.training_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'attending', 'completed', 'absent')),
  score NUMERIC(5,2),
  certificate_url TEXT,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Performance goals
CREATE TABLE public.performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  category TEXT NOT NULL CHECK (category IN ('productivity', 'quality', 'training', 'attendance', 'other')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainings
CREATE POLICY "Staff can view trainings" ON public.trainings
  FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Admins can manage trainings" ON public.trainings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for training_participants
CREATE POLICY "Staff can view participants" ON public.training_participants
  FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Staff can enroll in trainings" ON public.training_participants
  FOR INSERT WITH CHECK (is_staff(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Admins can manage participants" ON public.training_participants
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for performance_goals
CREATE POLICY "Users can view own goals" ON public.performance_goals
  FOR SELECT USING (auth.uid() = user_id OR is_staff(auth.uid()));

CREATE POLICY "Admins can manage goals" ON public.performance_goals
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_trainings_updated_at
  BEFORE UPDATE ON public.trainings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.performance_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();