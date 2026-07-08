
DROP POLICY IF EXISTS "Authenticated users can insert sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can update sections" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can delete sections" ON public.sections;

CREATE POLICY "Admins and editors can insert sections" ON public.sections
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can update sections" ON public.sections
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can delete sections" ON public.sections
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
