
-- Sequence for membership numbers (never reused)
CREATE SEQUENCE IF NOT EXISTS public.membership_seq START 1;

CREATE OR REPLACE FUNCTION public.next_membership_number()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'KN-' || LPAD(nextval('public.membership_seq')::text, 6, '0')
$$;

-- Parents
CREATE TABLE public.parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Children (each child is a member with a unique membership number)
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  membership_number TEXT NOT NULL UNIQUE DEFAULT public.next_membership_number(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE,
  sex TEXT,
  allergies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_number TEXT NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  booking_date DATE,
  booking_time TEXT,
  waiver_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grants: all access is via server-side service role only. No anon/authenticated access.
GRANT ALL ON public.parents TO service_role;
GRANT ALL ON public.children TO service_role;
GRANT ALL ON public.bookings TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.membership_seq TO service_role;

-- RLS enabled with no policies => locked to anon/authenticated; service role bypasses.
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_children_membership ON public.children(membership_number);
CREATE INDEX idx_bookings_membership ON public.bookings(membership_number);
