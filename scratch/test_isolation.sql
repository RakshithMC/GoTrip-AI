-- Test Multi-user Isolation with PostgreSQL RLS
DO $$
DECLARE
  test_user_a UUID := '5c5d3ba0-0fa8-4a48-8a89-d4ed857b44d0';
  test_user_b UUID := '00000000-0000-0000-0000-000000000002';
  visible_count_a INT;
  visible_count_b INT;
BEGIN
  -- 1. Simulate authenticated User A
  PERFORM set_config('request.jwt.claim.sub', test_user_a::text, true);
  PERFORM set_config('role', 'authenticated', true);

  SELECT count(*) INTO visible_count_a FROM public.user_preferences WHERE user_id = test_user_a;
  IF visible_count_a <> 1 THEN
    RAISE EXCEPTION 'User A should see exactly their own preference row, found %', visible_count_a;
  END IF;

  -- User A should NOT see any row for User B
  SELECT count(*) INTO visible_count_b FROM public.user_preferences WHERE user_id = test_user_b;
  IF visible_count_b <> 0 THEN
    RAISE EXCEPTION 'User A must NOT see User B preference row, found %', visible_count_b;
  END IF;

  -- 2. Simulate authenticated User B
  PERFORM set_config('request.jwt.claim.sub', test_user_b::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- User B should NOT see User A's preferences
  SELECT count(*) INTO visible_count_a FROM public.user_preferences WHERE user_id = test_user_a;
  IF visible_count_a <> 0 THEN
    RAISE EXCEPTION 'User B must NOT see User A preference row, found %', visible_count_a;
  END IF;

  RAISE NOTICE 'SUCCESS: Multi-user RLS isolation fully verified!';
END $$;
