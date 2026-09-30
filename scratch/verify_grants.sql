-- Check table privileges by role for user_preferences
SELECT 
  grantee, 
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as granted_privileges
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' AND table_name = 'user_preferences'
GROUP BY grantee
ORDER BY grantee;
