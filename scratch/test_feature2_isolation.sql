-- Test Feature 2 RLS Multi-User Isolation on trips and trip_itineraries
DO $$
DECLARE
  v_user_a UUID := '11111111-1111-4111-a111-111111111111';
  v_user_b UUID := '22222222-2222-4222-b222-222222222222';
  v_trip_a UUID := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
  v_trip_b UUID := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  v_count INT;
  v_updated INT;
BEGIN
  -- 1. Setup mock auth users if not present
  INSERT INTO auth.users (id, email)
  VALUES 
    (v_user_a, 'user_a_f2@gotrip.test'),
    (v_user_b, 'user_b_f2@gotrip.test')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Simulate User A inserting Trip A and Itinerary A
  PERFORM set_config('request.jwt.claim.sub', v_user_a::text, true);
  PERFORM set_config('role', 'authenticated', true);

  INSERT INTO public.trips (id, user_id, destination, dates, travelers, total_estimated_cost)
  VALUES (v_trip_a, v_user_a, 'Paris', '2026-10-01 - 2026-10-05', 2, 150000)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.trip_itineraries (trip_id, day, date, title, activities)
  VALUES (v_trip_a, 1, '2026-10-01', 'Day 1 in Paris', '[{"time":"09:00 AM","name":"Eiffel Tower","description":"Original activity","icon":"activity"}]'::jsonb)
  ON CONFLICT (trip_id, day) DO NOTHING;

  -- 3. Simulate User B inserting Trip B and Itinerary B
  PERFORM set_config('request.jwt.claim.sub', v_user_b::text, true);

  INSERT INTO public.trips (id, user_id, destination, dates, travelers, total_estimated_cost)
  VALUES (v_trip_b, v_user_b, 'Tokyo', '2026-11-01 - 2026-11-07', 1, 200000)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.trip_itineraries (trip_id, day, date, title, activities)
  VALUES (v_trip_b, 1, '2026-11-01', 'Day 1 in Tokyo', '[{"time":"10:00 AM","name":"Senso-ji","description":"Original activity","icon":"activity"}]'::jsonb)
  ON CONFLICT (trip_id, day) DO NOTHING;

  -- 4. User A attempts to view User B's itinerary -> EXPECT 0 ROWS
  PERFORM set_config('request.jwt.claim.sub', v_user_a::text, true);
  SELECT COUNT(*) INTO v_count FROM public.trip_itineraries WHERE trip_id = v_trip_b;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST FAILED: User A was able to SELECT User B itinerary! Count=%', v_count;
  END IF;

  -- 5. User A attempts to UPDATE User B's itinerary (cross-tenant replan attempt) -> EXPECT 0 ROWS UPDATED
  WITH upd AS (
    UPDATE public.trip_itineraries
    SET activities = '[{"time":"10:00 AM","name":"HACKED REPLACEMENT","description":"Malicious","icon":"activity"}]'::jsonb
    WHERE trip_id = v_trip_b AND day = 1
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_updated FROM upd;

  IF v_updated <> 0 THEN
    RAISE EXCEPTION 'TEST FAILED: User A was able to UPDATE User B itinerary! Rows=%', v_updated;
  END IF;

  -- 6. User A updates User A's OWN itinerary (Feature 2 Apply Changes) -> EXPECT 1 ROW UPDATED
  WITH upd_own AS (
    UPDATE public.trip_itineraries
    SET activities = '[{"time":"09:00 AM","name":"Musée d''Orsay","description":"Replanned alternative","icon":"activity","isReplanned":true}]'::jsonb
    WHERE trip_id = v_trip_a AND day = 1
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_updated FROM upd_own;

  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'TEST FAILED: User A could not update own itinerary! Rows=%', v_updated;
  END IF;

  -- 7. Cleanup test data
  PERFORM set_config('role', 'postgres', true);
  DELETE FROM public.trips WHERE id IN (v_trip_a, v_trip_b);
  DELETE FROM auth.users WHERE id IN (v_user_a, v_user_b);

  RAISE NOTICE 'FEATURE 2 RLS MULTI-USER ISOLATION TESTS PASSED SUCCESSFULLY!';
END $$;
