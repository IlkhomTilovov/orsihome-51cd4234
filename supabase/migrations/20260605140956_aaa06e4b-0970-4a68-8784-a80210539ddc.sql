
-- has_role is used INSIDE RLS policies on many tables (user_roles, products,
-- categories, promo_tiles, sets, etc.). RLS policy expressions evaluate as the
-- calling role, so anon/authenticated must be able to EXECUTE has_role or all
-- policies that reference it fail and return zero rows.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
