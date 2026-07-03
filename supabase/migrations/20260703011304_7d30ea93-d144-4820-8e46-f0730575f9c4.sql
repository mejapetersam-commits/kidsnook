-- Restrict SECURITY DEFINER functions so they can no longer be executed by
-- anonymous or signed-in API roles. They are only invoked from trusted
-- server functions using the service-role client.

DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.next_membership_number()',
    'public._admin_password()',
    'public.app_admin_update_booking(text, uuid, text)',
    'public.app_register_member(jsonb, jsonb)',
    'public.app_lookup_member(text)',
    'public.app_create_booking(text, text, text, text, boolean)',
    'public.app_register_and_book(jsonb, jsonb, text, text, text, boolean)',
    'public.app_admin_overview(text)',
    'public.app_admin_members(text)',
    'public.app_admin_bookings(text)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn);
  END LOOP;
END $$;