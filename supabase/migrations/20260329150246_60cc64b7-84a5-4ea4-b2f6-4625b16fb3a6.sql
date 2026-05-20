
-- ========================
-- ENUMS
-- ========================
CREATE TYPE public.complaint_type AS ENUM (
  'desmatamento', 'queimada', 'poluicao_hidrica', 'poluicao_ar',
  'descarte_irregular', 'caca_ilegal', 'mineracao_ilegal', 'outros'
);

CREATE TYPE public.complaint_status AS ENUM (
  'pending', 'under_analysis', 'in_progress', 'resolved', 'archived'
);

CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high');

CREATE TYPE public.license_type AS ENUM (
  'previa', 'instalacao', 'operacao', 'simplificada', 'autorizacao'
);

CREATE TYPE public.license_status AS ENUM (
  'draft', 'submitted', 'documentation', 'technical_analysis',
  'approved', 'rejected', 'expired'
);

CREATE TYPE public.user_role AS ENUM ('admin', 'analyst', 'inspector', 'viewer');

-- ========================
-- PROFILES TABLE
-- ========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  position TEXT,
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ========================
-- USER ROLES TABLE
-- ========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ========================
-- COMPLAINTS TABLE
-- ========================
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT NOT NULL UNIQUE,
  type public.complaint_type NOT NULL DEFAULT 'outros',
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'pending',
  location TEXT NOT NULL,
  coordinates TEXT,
  description TEXT NOT NULL DEFAULT '',
  anonymous BOOLEAN NOT NULL DEFAULT true,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert complaints" ON public.complaints FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can update complaints" ON public.complaints FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ========================
-- COMPLAINT TIMELINE
-- ========================
CREATE TABLE public.complaint_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL DEFAULT 'Sistema',
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view complaint timeline" ON public.complaint_timeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert complaint timeline" ON public.complaint_timeline FOR INSERT TO authenticated WITH CHECK (true);

-- ========================
-- COMPLAINT ATTACHMENTS
-- ========================
CREATE TABLE public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view attachments" ON public.complaint_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert attachments" ON public.complaint_attachments FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ========================
-- COMPLAINT TRACKING
-- ========================
CREATE TABLE public.complaint_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaint_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tracking" ON public.complaint_tracking FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view tracking by code" ON public.complaint_tracking FOR SELECT TO anon, authenticated USING (true);

-- ========================
-- LICENSES TABLE
-- ========================
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT NOT NULL UNIQUE,
  type public.license_type NOT NULL DEFAULT 'simplificada',
  status public.license_status NOT NULL DEFAULT 'draft',
  applicant_name TEXT NOT NULL,
  applicant_document TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  enterprise_name TEXT NOT NULL,
  enterprise_activity TEXT NOT NULL,
  enterprise_address TEXT NOT NULL,
  enterprise_coordinates TEXT,
  area_size NUMERIC,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all licenses" ON public.licenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert licenses" ON public.licenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update licenses" ON public.licenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ========================
-- LICENSE TIMELINE
-- ========================
CREATE TABLE public.license_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL DEFAULT 'Sistema',
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.license_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view license timeline" ON public.license_timeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert license timeline" ON public.license_timeline FOR INSERT TO authenticated WITH CHECK (true);

-- ========================
-- LICENSE DOCUMENTS
-- ========================
CREATE TABLE public.license_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.license_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view license documents" ON public.license_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert license documents" ON public.license_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update license documents" ON public.license_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ========================
-- TRAININGS TABLE
-- ========================
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'course',
  instructor TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  duration_hours INTEGER,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view trainings" ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage trainings" ON public.trainings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================
-- TRAINING PARTICIPANTS
-- ========================
CREATE TABLE public.training_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'enrolled',
  score NUMERIC,
  certificate_url TEXT,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (training_id, user_id)
);
ALTER TABLE public.training_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view participants" ON public.training_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage participants" ON public.training_participants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================
-- PERFORMANCE GOALS
-- ========================
CREATE TABLE public.performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  category TEXT NOT NULL DEFAULT 'productivity',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view goals" ON public.performance_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own goals" ON public.performance_goals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ========================
-- FUNCTIONS
-- ========================

-- Generate protocol number
CREATE OR REPLACE FUNCTION public.generate_protocol(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT;
  seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(protocol FROM LENGTH(prefix) + 2 + 5) AS INTEGER)
  ), 0) + 1 INTO seq
  FROM (
    SELECT protocol FROM public.complaints WHERE protocol LIKE prefix || '-%'
    UNION ALL
    SELECT protocol FROM public.licenses WHERE protocol LIKE prefix || '-%'
  ) sub;
  
  result := prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq::TEXT, 5, '0');
  RETURN result;
END;
$$;

-- Generate tracking code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- ========================
-- TRIGGER: Auto-create profile on signup
-- ========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- TRIGGER: Auto-update updated_at
-- ========================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ========================
-- STORAGE BUCKETS
-- ========================
INSERT INTO storage.buckets (id, name, public) VALUES ('complaints', 'complaints', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('licenses', 'licenses', false);

-- Storage policies
CREATE POLICY "Anyone can upload complaint attachments" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'complaints');
CREATE POLICY "Anyone can view complaint attachments" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'complaints');
CREATE POLICY "Staff can upload license documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'licenses');
CREATE POLICY "Staff can view license documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'licenses');
