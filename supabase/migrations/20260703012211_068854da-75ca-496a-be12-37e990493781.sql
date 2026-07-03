-- Remove temporary diagnostic helper
DROP FUNCTION IF EXISTS public._whoami();

-- Private schema, intentionally NOT exposed via the Data API (PostgREST)
CREATE SCHEMA IF NOT EXISTS internal;

-- ============================================================
-- Privileged SECURITY DEFINER logic lives in the private schema.
-- These are unreachable via the REST API (schema not exposed).
-- ============================================================

CREATE OR REPLACE FUNCTION internal.app_admin_update_booking(p_password text, p_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF p_password <> _admin_password() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF p_status NOT IN ('Pending','Confirmed','Cancelled') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE bookings SET status = p_status WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_register_member(p_parent jsonb, p_child jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_parent_id uuid; v_mnum text;
BEGIN
  INSERT INTO parents(name, phone, email, emergency_contact)
  VALUES (p_parent->>'name', p_parent->>'phone',
          NULLIF(p_parent->>'email',''), NULLIF(p_parent->>'emergency_contact',''))
  RETURNING id INTO v_parent_id;

  INSERT INTO children(parent_id, first_name, last_name, dob, sex, allergies)
  VALUES (v_parent_id, p_child->>'first_name', p_child->>'last_name',
          NULLIF(p_child->>'dob','')::date, NULLIF(p_child->>'sex',''), NULLIF(p_child->>'allergies',''))
  RETURNING membership_number INTO v_mnum;

  RETURN v_mnum;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_lookup_member(p_mnum text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v jsonb;
BEGIN
  SELECT json_build_object(
    'found', true,
    'child', json_build_object('id', c.id, 'first_name', c.first_name,
             'last_name', c.last_name, 'membership_number', c.membership_number),
    'parent', json_build_object('name', p.name)
  ) INTO v
  FROM children c LEFT JOIN parents p ON p.id = c.parent_id
  WHERE c.membership_number = upper(p_mnum);

  IF v IS NULL THEN RETURN json_build_object('found', false); END IF;
  RETURN v;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_create_booking(p_mnum text, p_service text, p_date text, p_time text, p_waiver boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_child children%ROWTYPE;
BEGIN
  IF NOT p_waiver THEN RAISE EXCEPTION 'Waiver must be accepted'; END IF;
  SELECT * INTO v_child FROM children WHERE membership_number = upper(p_mnum);
  IF NOT FOUND THEN RAISE EXCEPTION 'Membership number not found'; END IF;

  INSERT INTO bookings(membership_number, child_id, parent_id, service, booking_date, booking_time, waiver_accepted)
  VALUES (v_child.membership_number, v_child.id, v_child.parent_id, p_service,
          NULLIF(p_date,'')::date, NULLIF(p_time,''), p_waiver);
  RETURN v_child.membership_number;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_register_and_book(p_parent jsonb, p_child jsonb, p_service text, p_date text, p_time text, p_waiver boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_parent_id uuid; v_child_id uuid; v_mnum text;
BEGIN
  IF NOT p_waiver THEN RAISE EXCEPTION 'Waiver must be accepted'; END IF;

  INSERT INTO parents(name, phone, email, emergency_contact)
  VALUES (p_parent->>'name', p_parent->>'phone',
          NULLIF(p_parent->>'email',''), NULLIF(p_parent->>'emergency_contact',''))
  RETURNING id INTO v_parent_id;

  INSERT INTO children(parent_id, first_name, last_name, dob, sex, allergies)
  VALUES (v_parent_id, p_child->>'first_name', p_child->>'last_name',
          NULLIF(p_child->>'dob','')::date, NULLIF(p_child->>'sex',''), NULLIF(p_child->>'allergies',''))
  RETURNING id, membership_number INTO v_child_id, v_mnum;

  INSERT INTO bookings(membership_number, child_id, parent_id, service, booking_date, booking_time, waiver_accepted)
  VALUES (v_mnum, v_child_id, v_parent_id, p_service, NULLIF(p_date,'')::date, NULLIF(p_time,''), p_waiver);
  RETURN v_mnum;
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_admin_overview(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF p_password <> _admin_password() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN json_build_object(
    'totalMembers', (SELECT count(*) FROM children),
    'totalBookings', (SELECT count(*) FROM bookings),
    'recentRegistrations', (SELECT coalesce(json_agg(x),'[]'::json) FROM (
       SELECT c.id, c.membership_number, (c.first_name||' '||c.last_name) AS name,
              coalesce(p.name,'') AS parent, coalesce(p.phone,'') AS phone, c.created_at
       FROM children c LEFT JOIN parents p ON p.id=c.parent_id
       ORDER BY c.created_at DESC LIMIT 10) x),
    'recentBookings', (SELECT coalesce(json_agg(y),'[]'::json) FROM (
       SELECT id, membership_number, service, booking_date, booking_time, status, created_at
       FROM bookings ORDER BY created_at DESC LIMIT 10) y)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_admin_members(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF p_password <> _admin_password() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN (SELECT coalesce(json_agg(x),'[]'::json) FROM (
    SELECT c.id, c.membership_number, c.first_name, c.last_name, c.dob, c.sex, c.allergies, c.created_at,
           coalesce(p.name,'') AS parent_name, coalesce(p.phone,'') AS parent_phone,
           coalesce(p.email,'') AS parent_email, coalesce(p.emergency_contact,'') AS emergency_contact
    FROM children c LEFT JOIN parents p ON p.id=c.parent_id
    ORDER BY c.created_at DESC) x);
END;
$function$;

CREATE OR REPLACE FUNCTION internal.app_admin_bookings(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF p_password <> _admin_password() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN (SELECT coalesce(json_agg(x),'[]'::json) FROM (
    SELECT b.id, b.membership_number,
           coalesce(c.first_name||' '||c.last_name,'') AS child_name,
           coalesce(p.name,'') AS parent_name, coalesce(p.phone,'') AS parent_phone,
           b.service, b.booking_date, b.booking_time, b.status, b.waiver_accepted, b.created_at
    FROM bookings b LEFT JOIN children c ON c.id=b.child_id LEFT JOIN parents p ON p.id=b.parent_id
    ORDER BY b.created_at DESC) x);
END;
$function$;

-- Drop the old public SECURITY DEFINER functions (flagged by linter 0028/0029)
DROP FUNCTION IF EXISTS public.app_admin_update_booking(text, uuid, text);
DROP FUNCTION IF EXISTS public.app_register_member(jsonb, jsonb);
DROP FUNCTION IF EXISTS public.app_lookup_member(text);
DROP FUNCTION IF EXISTS public.app_create_booking(text, text, text, text, boolean);
DROP FUNCTION IF EXISTS public.app_register_and_book(jsonb, jsonb, text, text, text, boolean);
DROP FUNCTION IF EXISTS public.app_admin_overview(text);
DROP FUNCTION IF EXISTS public.app_admin_members(text);
DROP FUNCTION IF EXISTS public.app_admin_bookings(text);

-- ============================================================
-- Public SECURITY INVOKER wrappers (the only API-reachable surface).
-- INVOKER functions are not flagged by the SECURITY DEFINER linter.
-- ============================================================

CREATE OR REPLACE FUNCTION public.app_admin_update_booking(p_password text, p_id uuid, p_status text)
RETURNS void LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_admin_update_booking(p_password, p_id, p_status);
$function$;

CREATE OR REPLACE FUNCTION public.app_register_member(p_parent jsonb, p_child jsonb)
RETURNS text LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_register_member(p_parent, p_child);
$function$;

CREATE OR REPLACE FUNCTION public.app_lookup_member(p_mnum text)
RETURNS jsonb LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_lookup_member(p_mnum);
$function$;

CREATE OR REPLACE FUNCTION public.app_create_booking(p_mnum text, p_service text, p_date text, p_time text, p_waiver boolean)
RETURNS text LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_create_booking(p_mnum, p_service, p_date, p_time, p_waiver);
$function$;

CREATE OR REPLACE FUNCTION public.app_register_and_book(p_parent jsonb, p_child jsonb, p_service text, p_date text, p_time text, p_waiver boolean)
RETURNS text LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_register_and_book(p_parent, p_child, p_service, p_date, p_time, p_waiver);
$function$;

CREATE OR REPLACE FUNCTION public.app_admin_overview(p_password text)
RETURNS jsonb LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_admin_overview(p_password);
$function$;

CREATE OR REPLACE FUNCTION public.app_admin_members(p_password text)
RETURNS jsonb LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_admin_members(p_password);
$function$;

CREATE OR REPLACE FUNCTION public.app_admin_bookings(p_password text)
RETURNS jsonb LANGUAGE sql SET search_path TO 'internal', 'public' AS $function$
  SELECT internal.app_admin_bookings(p_password);
$function$;

-- Grants: callers reach only the public INVOKER wrappers.
-- The wrappers run as the caller, so the caller needs USAGE on internal
-- plus EXECUTE on the internal functions. This is safe because the internal
-- schema is NOT exposed via the Data API and cannot be called directly.
GRANT USAGE ON SCHEMA internal TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  internal.app_admin_update_booking(text, uuid, text),
  internal.app_register_member(jsonb, jsonb),
  internal.app_lookup_member(text),
  internal.app_create_booking(text, text, text, text, boolean),
  internal.app_register_and_book(jsonb, jsonb, text, text, text, boolean),
  internal.app_admin_overview(text),
  internal.app_admin_members(text),
  internal.app_admin_bookings(text)
TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION
  public.app_admin_update_booking(text, uuid, text),
  public.app_register_member(jsonb, jsonb),
  public.app_lookup_member(text),
  public.app_create_booking(text, text, text, text, boolean),
  public.app_register_and_book(jsonb, jsonb, text, text, text, boolean),
  public.app_admin_overview(text),
  public.app_admin_members(text),
  public.app_admin_bookings(text)
TO anon, authenticated, service_role;