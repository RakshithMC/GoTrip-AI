INSERT INTO public.user_preferences (
  user_id,
  interests,
  disliked_interests,
  travel_style,
  activity_preferences,
  budget_min,
  budget_max,
  preferred_transport,
  trip_pace
)
VALUES (
  '5c5d3ba0-0fa8-4a48-8a89-d4ed857b44d0',
  '{"Nature": 1, "Culture": 1, "Food": 1}'::jsonb,
  '["History"]'::jsonb,
  'Balanced',
  '["Museums", "Parks"]'::jsonb,
  10000,
  50000,
  'Transit',
  'Moderate'
)
ON CONFLICT (user_id) DO UPDATE SET
  interests = EXCLUDED.interests,
  disliked_interests = EXCLUDED.disliked_interests,
  travel_style = EXCLUDED.travel_style,
  activity_preferences = EXCLUDED.activity_preferences,
  budget_min = EXCLUDED.budget_min,
  budget_max = EXCLUDED.budget_max,
  preferred_transport = EXCLUDED.preferred_transport,
  trip_pace = EXCLUDED.trip_pace,
  updated_at = now();

NOTIFY pgrst, 'reload schema';
