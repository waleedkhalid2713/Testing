create table public.user_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page text not null check (char_length(page) <= 200),
  region text not null default 'Unknown',
  visited_at timestamptz not null default now()
);

alter table public.user_activity_events enable row level security;

create index user_activity_events_visited_at_idx
  on public.user_activity_events (visited_at desc);

create index user_activity_events_user_id_idx
  on public.user_activity_events (user_id);

create policy "Users can record their own page visits"
on public.user_activity_events
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Admins can view page activity"
on public.user_activity_events
for select
to authenticated
using (public.is_admin());
