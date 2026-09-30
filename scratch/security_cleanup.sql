-- Security cleanup for public.user_preferences:
-- Remove all table privileges from the 'anon' role on private user data.
REVOKE ALL ON TABLE public.user_preferences FROM anon;

-- Ensure 'authenticated' has required CRUD permissions subject to existing RLS policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_preferences TO authenticated;

-- Ensure 'postgres' and 'service_role' retain full administrative permissions.
GRANT ALL ON TABLE public.user_preferences TO postgres, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
