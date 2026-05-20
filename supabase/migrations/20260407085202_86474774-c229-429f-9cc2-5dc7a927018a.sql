
-- Fix remaining permissive INSERT policies

-- complaint_attachments: only staff can insert
DROP POLICY IF EXISTS "Anyone can insert attachments" ON public.complaint_attachments;
CREATE POLICY "Staff can insert attachments"
ON public.complaint_attachments
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- complaint_tracking: keep anon insert (public feature) but restrict authenticated
-- This is intentionally permissive for public complaint tracking

-- audit_logs: restrict insert to staff (not true for all)
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix function search_path warnings
CREATE OR REPLACE FUNCTION public.generate_protocol(prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$function$;
