-- Every enrollment (registration) now gets a unique, sequential membership
-- number in the same KN-000001 style already used by the legacy members
-- flow, but generated atomically via a dedicated sequence so concurrent
-- registrations can never collide (the old count()-based approach could).

create sequence if not exists public.membership_number_seq start with 1;

alter table public.enrollments
  add column if not exists membership_number text;

create or replace function public.set_membership_number()
returns trigger
language plpgsql
as $$
begin
  if new.membership_number is null then
    new.membership_number := 'KN-' || lpad(nextval('public.membership_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_membership_number on public.enrollments;
create trigger trg_set_membership_number
  before insert on public.enrollments
  for each row
  execute function public.set_membership_number();

-- Backfill any existing rows that predate this column.
do $$
declare
  r record;
begin
  for r in select id from public.enrollments where membership_number is null order by created_at asc loop
    update public.enrollments
      set membership_number = 'KN-' || lpad(nextval('public.membership_number_seq')::text, 6, '0')
      where id = r.id;
  end loop;
end $$;

alter table public.enrollments
  alter column membership_number set not null;

alter table public.enrollments
  add constraint enrollments_membership_number_key unique (membership_number);
