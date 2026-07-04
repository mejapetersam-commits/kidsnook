-- ============ SERVICES (public, readable) ============
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are publicly readable"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.services (name, description, sort_order) VALUES
  ('Hair & Beauty', 'Expert styling that keeps your little one looking fabulous.', 1),
  ('Gaming Lounge', 'Modern gaming stations for supervised entertainment while waiting.', 2),
  ('Kids Library', 'A cozy reading corner that encourages learning and imagination.', 3),
  ('Outdoor Activities', 'Safe outdoor experiences that help kids stay active and social.', 4),
  ('Creative Corner', 'Art and craft activities designed to inspire creativity.', 5),
  ('Nanny & Me Club', 'A structured play experience for toddlers 1-3 to explore and grow with their nanny.', 6);

-- ============ ENROLLMENTS (private, RLS-locked) ============
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_full_name text NOT NULL,
  child_dob date NOT NULL,
  child_gender text,
  child_nickname text,
  parent_full_name text NOT NULL,
  parent_relationship text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text NOT NULL,
  home_address text NOT NULL,
  ec1_name text NOT NULL,
  ec1_relationship text NOT NULL,
  ec1_phone text NOT NULL,
  ec2_name text,
  ec2_relationship text,
  ec2_phone text,
  allergies text NOT NULL,
  medications text,
  medical_conditions text,
  doctor_name text,
  doctor_phone text,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferred_start_date date NOT NULL,
  dropoff_time text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- No anon/authenticated grants: submissions are NOT publicly readable.
GRANT ALL ON public.enrollments TO service_role;

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
-- No policies => locked. Only the SECURITY DEFINER function below can write,
-- and only service_role / trusted server access can read.

-- ============ Secure insert wrapper ============
CREATE OR REPLACE FUNCTION internal.app_create_enrollment(p_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_id uuid;
BEGIN
  IF NOT (p_data->>'consent')::boolean THEN RAISE EXCEPTION 'Consent required'; END IF;
  IF jsonb_array_length(coalesce(p_data->'services','[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'At least one service required';
  END IF;

  INSERT INTO enrollments(
    child_full_name, child_dob, child_gender, child_nickname,
    parent_full_name, parent_relationship, parent_phone, parent_email, home_address,
    ec1_name, ec1_relationship, ec1_phone,
    ec2_name, ec2_relationship, ec2_phone,
    allergies, medications, medical_conditions, doctor_name, doctor_phone,
    services, preferred_start_date, dropoff_time, consent
  ) VALUES (
    p_data->>'child_full_name', (p_data->>'child_dob')::date,
    NULLIF(p_data->>'child_gender',''), NULLIF(p_data->>'child_nickname',''),
    p_data->>'parent_full_name', p_data->>'parent_relationship',
    p_data->>'parent_phone', p_data->>'parent_email', p_data->>'home_address',
    p_data->>'ec1_name', p_data->>'ec1_relationship', p_data->>'ec1_phone',
    NULLIF(p_data->>'ec2_name',''), NULLIF(p_data->>'ec2_relationship',''), NULLIF(p_data->>'ec2_phone',''),
    p_data->>'allergies', NULLIF(p_data->>'medications',''), NULLIF(p_data->>'medical_conditions',''),
    NULLIF(p_data->>'doctor_name',''), NULLIF(p_data->>'doctor_phone',''),
    coalesce(p_data->'services','[]'::jsonb), (p_data->>'preferred_start_date')::date,
    NULLIF(p_data->>'dropoff_time',''), (p_data->>'consent')::boolean
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.app_create_enrollment(p_data jsonb)
RETURNS uuid LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_create_enrollment(p_data);
$function$;

GRANT EXECUTE ON FUNCTION internal.app_create_enrollment(jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.app_create_enrollment(jsonb) TO anon, authenticated, service_role;