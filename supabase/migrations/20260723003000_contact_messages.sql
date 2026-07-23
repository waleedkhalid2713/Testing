create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  email text not null check (char_length(trim(email)) between 3 and 255),
  subject text not null check (char_length(trim(subject)) between 3 and 150),
  category text not null check (
    category in (
      'General Inquiry',
      'Technical Support',
      'Bootcamp',
      'Account Issue',
      'Forecasts',
      'Partnership',
      'Feedback',
      'Other'
    )
  ),
  message text not null check (char_length(trim(message)) between 10 and 5000),
  status text not null default 'Unread' check (status in ('Unread', 'In Progress', 'Resolved')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (
  status = 'Unread'
  and char_length(trim(name)) between 2 and 100
  and char_length(trim(email)) between 3 and 255
  and char_length(trim(subject)) between 3 and 150
  and char_length(trim(message)) between 10 and 5000
);

create policy "Admins can view contact messages"
on public.contact_messages
for select
to authenticated
using (public.is_admin());

create policy "Admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index contact_messages_created_at_idx
on public.contact_messages (created_at desc);

create index contact_messages_status_idx
on public.contact_messages (status);
