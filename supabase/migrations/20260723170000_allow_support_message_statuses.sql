-- Allow the support inbox status values used by the admin dashboard.
-- Run this migration in Supabase SQL Editor if migrations are not deployed automatically.

alter table public.contact_messages
  drop constraint if exists contact_messages_status_check;

alter table public.contact_messages
  add constraint contact_messages_status_check
  check (status in ('Unread', 'In progress', 'Resolved'));
