DROP POLICY IF EXISTS "Authenticated users can manage sections" ON public.sections;

CREATE POLICY "Authenticated users can insert sections"
ON public.sections
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sections"
ON public.sections
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sections"
ON public.sections
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');