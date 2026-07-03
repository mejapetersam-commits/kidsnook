
ALTER TABLE public.parents
  ADD COLUMN IF NOT EXISTS relationship text,
  ADD COLUMN IF NOT EXISTS home_address text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS emergency_contact_alt_phone text;

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS medical_conditions text,
  ADD COLUMN IF NOT EXISTS doctor_name text,
  ADD COLUMN IF NOT EXISTS doctor_phone text,
  ADD COLUMN IF NOT EXISTS service_preferences text,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE OR REPLACE FUNCTION internal.app_register_member(p_parent jsonb, p_child jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_parent_id uuid; v_mnum text;
BEGIN
  INSERT INTO parents(name, phone, email, emergency_contact, relationship, home_address,
                      emergency_contact_name, emergency_contact_relationship,
                      emergency_contact_phone, emergency_contact_alt_phone)
  VALUES (p_parent->>'name', p_parent->>'phone',
          NULLIF(p_parent->>'email',''),
          NULLIF(p_parent->>'emergency_contact',''),
          NULLIF(p_parent->>'relationship',''),
          NULLIF(p_parent->>'home_address',''),
          NULLIF(p_parent->>'emergency_contact_name',''),
          NULLIF(p_parent->>'emergency_contact_relationship',''),
          NULLIF(p_parent->>'emergency_contact_phone',''),
          NULLIF(p_parent->>'emergency_contact_alt_phone',''))
  RETURNING id INTO v_parent_id;

  INSERT INTO children(parent_id, first_name, last_name, dob, sex, allergies,
                       medical_conditions, doctor_name, doctor_phone, service_preferences, notes)
  VALUES (v_parent_id, p_child->>'first_name', p_child->>'last_name',
          NULLIF(p_child->>'dob','')::date, NULLIF(p_child->>'sex',''), NULLIF(p_child->>'allergies',''),
          NULLIF(p_child->>'medical_conditions',''), NULLIF(p_child->>'doctor_name',''),
          NULLIF(p_child->>'doctor_phone',''), NULLIF(p_child->>'service_preferences',''),
          NULLIF(p_child->>'notes',''))
  RETURNING membership_number INTO v_mnum;

  RETURN v_mnum;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_register_and_book(p_parent jsonb, p_child jsonb, p_service text, p_date text, p_time text, p_waiver boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_parent_id uuid; v_child_id uuid; v_mnum text;
BEGIN
  IF NOT p_waiver THEN RAISE EXCEPTION 'Waiver must be accepted'; END IF;

  INSERT INTO parents(name, phone, email, emergency_contact, relationship, home_address,
                      emergency_contact_name, emergency_contact_relationship,
                      emergency_contact_phone, emergency_contact_alt_phone)
  VALUES (p_parent->>'name', p_parent->>'phone',
          NULLIF(p_parent->>'email',''),
          NULLIF(p_parent->>'emergency_contact',''),
          NULLIF(p_parent->>'relationship',''),
          NULLIF(p_parent->>'home_address',''),
          NULLIF(p_parent->>'emergency_contact_name',''),
          NULLIF(p_parent->>'emergency_contact_relationship',''),
          NULLIF(p_parent->>'emergency_contact_phone',''),
          NULLIF(p_parent->>'emergency_contact_alt_phone',''))
  RETURNING id INTO v_parent_id;

  INSERT INTO children(parent_id, first_name, last_name, dob, sex, allergies,
                       medical_conditions, doctor_name, doctor_phone, service_preferences, notes)
  VALUES (v_parent_id, p_child->>'first_name', p_child->>'last_name',
          NULLIF(p_child->>'dob','')::date, NULLIF(p_child->>'sex',''), NULLIF(p_child->>'allergies',''),
          NULLIF(p_child->>'medical_conditions',''), NULLIF(p_child->>'doctor_name',''),
          NULLIF(p_child->>'doctor_phone',''), NULLIF(p_child->>'service_preferences',''),
          NULLIF(p_child->>'notes',''))
  RETURNING id, membership_number INTO v_child_id, v_mnum;

  INSERT INTO bookings(membership_number, child_id, parent_id, service, booking_date, booking_time, waiver_accepted)
  VALUES (v_mnum, v_child_id, v_parent_id, p_service, NULLIF(p_date,'')::date, NULLIF(p_time,''), p_waiver);
  RETURN v_mnum;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_admin_members(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF p_password <> _admin_password() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN (SELECT coalesce(json_agg(x),'[]'::json) FROM (
    SELECT c.id, c.membership_number, c.first_name, c.last_name, c.dob, c.sex, c.allergies,
           c.medical_conditions, c.doctor_name, c.doctor_phone, c.service_preferences, c.notes,
           c.created_at,
           coalesce(p.name,'') AS parent_name, coalesce(p.phone,'') AS parent_phone,
           coalesce(p.email,'') AS parent_email, coalesce(p.emergency_contact,'') AS emergency_contact,
           coalesce(p.relationship,'') AS parent_relationship,
           coalesce(p.home_address,'') AS home_address,
           coalesce(p.emergency_contact_name,'') AS emergency_contact_name,
           coalesce(p.emergency_contact_relationship,'') AS emergency_contact_relationship,
           coalesce(p.emergency_contact_phone,'') AS emergency_contact_phone,
           coalesce(p.emergency_contact_alt_phone,'') AS emergency_contact_alt_phone
    FROM children c LEFT JOIN parents p ON p.id=c.parent_id
    ORDER BY c.created_at DESC) x);
END;
$function$;
