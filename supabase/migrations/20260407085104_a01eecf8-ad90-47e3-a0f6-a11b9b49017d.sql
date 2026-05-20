
-- 1. Create security definer function for role checking (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Create helper to check if user is staff (admin, analyst, or inspector)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'analyst', 'inspector')
  )
$$;

-- 3. Fix user_roles RLS - replace self-referencing policy with security definer
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Restrict complaints SELECT to staff only
DROP POLICY IF EXISTS "Staff can view all complaints" ON public.complaints;
CREATE POLICY "Staff can view all complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- 5. Restrict complaints UPDATE to staff only
DROP POLICY IF EXISTS "Staff can update complaints" ON public.complaints;
CREATE POLICY "Staff can update complaints"
ON public.complaints
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- 6. Restrict licenses SELECT to staff
DROP POLICY IF EXISTS "Staff can view all licenses" ON public.licenses;
CREATE POLICY "Staff can view all licenses"
ON public.licenses
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- 7. Restrict licenses INSERT to staff
DROP POLICY IF EXISTS "Staff can insert licenses" ON public.licenses;
CREATE POLICY "Staff can insert licenses"
ON public.licenses
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- 8. Restrict licenses UPDATE to staff
DROP POLICY IF EXISTS "Staff can update licenses" ON public.licenses;
CREATE POLICY "Staff can update licenses"
ON public.licenses
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- 9. Restrict complaint_attachments SELECT to staff
DROP POLICY IF EXISTS "Staff can view attachments" ON public.complaint_attachments;
CREATE POLICY "Staff can view attachments"
ON public.complaint_attachments
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- 10. Restrict complaint_timeline to staff
DROP POLICY IF EXISTS "Staff can view complaint timeline" ON public.complaint_timeline;
CREATE POLICY "Staff can view complaint timeline"
ON public.complaint_timeline
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can insert complaint timeline" ON public.complaint_timeline;
CREATE POLICY "Staff can insert complaint timeline"
ON public.complaint_timeline
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- 11. Restrict license_documents to staff
DROP POLICY IF EXISTS "Staff can view license documents" ON public.license_documents;
CREATE POLICY "Staff can view license documents"
ON public.license_documents
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can insert license documents" ON public.license_documents;
CREATE POLICY "Staff can insert license documents"
ON public.license_documents
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can update license documents" ON public.license_documents;
CREATE POLICY "Staff can update license documents"
ON public.license_documents
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- 12. Restrict license_timeline to staff
DROP POLICY IF EXISTS "Staff can view license timeline" ON public.license_timeline;
CREATE POLICY "Staff can view license timeline"
ON public.license_timeline
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can insert license timeline" ON public.license_timeline;
CREATE POLICY "Staff can insert license timeline"
ON public.license_timeline
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- 13. Restrict trainings to staff
DROP POLICY IF EXISTS "Staff can view trainings" ON public.trainings;
CREATE POLICY "Staff can view trainings"
ON public.trainings
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can manage trainings" ON public.trainings;
CREATE POLICY "Staff can manage trainings"
ON public.trainings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 14. Restrict training_participants to staff
DROP POLICY IF EXISTS "Staff can view participants" ON public.training_participants;
CREATE POLICY "Staff can view participants"
ON public.training_participants
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can manage participants" ON public.training_participants;
CREATE POLICY "Staff can manage participants"
ON public.training_participants
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 15. Create audit_logs table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 16. Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
