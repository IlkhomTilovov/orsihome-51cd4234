-- Remove public INSERT on order_items: edge function uses service role and bypasses RLS
DROP POLICY IF EXISTS "Public can create order_items" ON public.order_items;

-- Remove public INSERT on customers: edge function uses service role for guest checkout
DROP POLICY IF EXISTS "Public can create customers" ON public.customers;