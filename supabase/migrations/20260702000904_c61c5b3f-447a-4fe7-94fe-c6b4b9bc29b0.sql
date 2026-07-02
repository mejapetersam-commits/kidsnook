
-- Admin password lives here for now. TODO: replace with real admin auth/roles.
CREATE OR REPLACE FUNCTION public._admin_password()
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT 'kidsnook2024'::text
$$;

-- Register a member (parent + child), returns membership number
CREATE OR REPLACE FUNCTION public.app_register_member(p_parent jsonb, p_child jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Lookup a member by membership number (returns names only)
CREATE OR REPLACE FUNCTION public.app_lookup_member(p_mnum text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Create a booking for an existing member
CREATE OR REPLACE FUNCTION public.app_create_booking(
  p_mnum text, p_service text, p_date text, p_time text, p_waiver boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Register a new client and create their first booking
CREATE OR REPLACE FUNCTION public.app_register_and_book(
  p_parent jsonb, p_child jsonb, p_service text, p_date text, p_time text, p_waiver boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Admin: overview
CREATE OR REPLACE FUNCTION public.app_admin_overview(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Admin: members list
CREATE OR REPLACE FUNCTION public.app_admin_members(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_password <> _admin_password() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN (SELECT coalesce(json_agg(x),'[]'::json) FROM (
    SELECT c.id, c.membership_number, c.first_name, c.last_name, c.dob, c.sex, c.allergies, c.created_at,
           coalesce(p.name,'') AS parent_name, coalesce(p.phone,'') AS parent_phone,
           coalesce(p.email,'') AS parent_email, coalesce(p.emergency_contact,'') AS emergency_contact
    FROM children c LEFT JOIN parents p ON p.id=c.parent_id
    ORDER BY c.created_at DESC) x);
END;
$$;

-- Admin: bookings list
CREATE OR REPLACE FUNCTION public.app_admin_bookings(p_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Admin: update booking status
CREATE OR REPLACE FUNCTION public.app_admin_update_booking(p_password text, p_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_password <> _admin_password() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  IF p_status NOT IN ('Pending','Confirmed','Cancelled') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE bookings SET status = p_status WHERE id = p_id;
END;
$$;

-- Allow calling these functions from the app (execute only; tables stay locked)
GRANT EXECUTE ON FUNCTION public.app_register_member(jsonb, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_lookup_member(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_create_booking(text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_register_and_book(jsonb, jsonb, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_admin_overview(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_admin_members(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_admin_bookings(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_admin_update_booking(text, uuid, text) TO anon, authenticated;
