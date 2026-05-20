-- Create enum types
CREATE TYPE public.complaint_status AS ENUM ('pending', 'under_analysis', 'in_progress', 'resolved', 'archived');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.complaint_type AS ENUM ('desmatamento', 'queimada', 'poluicao_hidrica', 'poluicao_ar', 'descarte_irregular', 'caca_ilegal', 'mineracao_ilegal', 'outros');
CREATE TYPE public.license_status AS ENUM ('draft', 'submitted', 'documentation', 'technical_analysis', 'approved', 'rejected', 'expired');
CREATE TYPE public.license_type AS ENUM ('previa', 'instalacao', 'operacao', 'simplificada', 'autorizacao');
CREATE TYPE public.user_role AS ENUM ('admin', 'analyst', 'inspector', 'viewer');

-- Profiles table for collaborators
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT,
  position TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT UNIQUE NOT NULL,
  type complaint_type NOT NULL,
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'pending',
  location TEXT NOT NULL,
  coordinates TEXT,
  description TEXT NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complaint attachments
CREATE TABLE public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complaint timeline/history
CREATE TABLE public.complaint_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Licenses table
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT UNIQUE NOT NULL,
  type license_type NOT NULL,
  status license_status NOT NULL DEFAULT 'draft',
  applicant_name TEXT NOT NULL,
  applicant_document TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  enterprise_name TEXT NOT NULL,
  enterprise_activity TEXT NOT NULL,
  enterprise_address TEXT NOT NULL,
  enterprise_coordinates TEXT,
  description TEXT,
  area_size DECIMAL,
  assigned_to UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- License documents
CREATE TABLE public.license_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- License timeline
CREATE TABLE public.license_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public complaint tracking (for citizens to track their complaints)
CREATE TABLE public.complaint_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  tracking_code TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to generate protocol numbers
CREATE OR REPLACE FUNCTION generate_protocol(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_part TEXT;
  seq_number INTEGER;
  result TEXT;
BEGIN
  year_part := to_char(now(), 'YYYY');
  
  IF prefix = 'DEN' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(protocol FROM 9) AS INTEGER)), 0) + 1
    INTO seq_number
    FROM public.complaints
    WHERE protocol LIKE prefix || '-' || year_part || '-%';
  ELSE
    SELECT COALESCE(MAX(CAST(SUBSTRING(protocol FROM 9) AS INTEGER)), 0) + 1
    INTO seq_number
    FROM public.licenses
    WHERE protocol LIKE prefix || '-' || year_part || '-%';
  END IF;
  
  result := prefix || '-' || year_part || '-' || LPAD(seq_number::TEXT, 5, '0');
  RETURN result;
END;
$$;

-- Function to generate tracking codes
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || SUBSTRING(chars FROM floor(random() * length(chars) + 1)::INTEGER FOR 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_tracking ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is authenticated staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'analyst', 'inspector')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Staff can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for complaints
CREATE POLICY "Staff can view all complaints" ON public.complaints
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Anonymous can create complaints" ON public.complaints
  FOR INSERT TO anon WITH CHECK (true);

-- RLS Policies for complaint attachments
CREATE POLICY "Staff can manage attachments" ON public.complaint_attachments
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Anon can insert attachments" ON public.complaint_attachments
  FOR INSERT TO anon WITH CHECK (true);

-- RLS Policies for complaint timeline
CREATE POLICY "Staff can view timeline" ON public.complaint_timeline
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can add timeline entries" ON public.complaint_timeline
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- RLS Policies for licenses
CREATE POLICY "Staff can manage licenses" ON public.licenses
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for license documents
CREATE POLICY "Staff can manage license documents" ON public.license_documents
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for license timeline
CREATE POLICY "Staff can manage license timeline" ON public.license_timeline
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for complaint tracking (public access for citizens)
CREATE POLICY "Anyone can view tracking by code" ON public.complaint_tracking
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can create tracking" ON public.complaint_tracking
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Create storage buckets for files
INSERT INTO storage.buckets (id, name, public) VALUES ('complaints', 'complaints', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('licenses', 'licenses', false);

-- Storage policies for complaints bucket (public for viewing evidence)
CREATE POLICY "Anyone can view complaint files" ON storage.objects
  FOR SELECT USING (bucket_id = 'complaints');

CREATE POLICY "Staff can upload complaint files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'complaints');

CREATE POLICY "Anon can upload complaint files" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'complaints');

-- Storage policies for licenses bucket (private)
CREATE POLICY "Staff can view license files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'licenses' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can upload license files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'licenses' AND public.is_staff(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_type ON public.complaints(type);
CREATE INDEX idx_complaints_priority ON public.complaints(priority);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_licenses_type ON public.licenses(type);
CREATE INDEX idx_complaint_tracking_code ON public.complaint_tracking(tracking_code);