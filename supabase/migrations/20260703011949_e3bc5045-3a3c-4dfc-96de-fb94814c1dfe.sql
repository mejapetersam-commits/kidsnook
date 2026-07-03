CREATE OR REPLACE FUNCTION public._whoami()
RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
GRANT EXECUTE ON FUNCTION public._whoami() TO anon, authenticated, service_role;