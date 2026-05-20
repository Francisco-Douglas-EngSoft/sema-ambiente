-- Fix function search_path warnings
CREATE OR REPLACE FUNCTION generate_protocol(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;