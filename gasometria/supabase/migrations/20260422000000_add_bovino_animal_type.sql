INSERT INTO public.animal_types (nome)
SELECT 'Bovino'
WHERE NOT EXISTS (SELECT 1 FROM public.animal_types WHERE nome = 'Bovino');
