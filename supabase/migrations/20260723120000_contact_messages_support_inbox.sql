-- Support inbox access for Epic Trader administrators.
-- Run this migration in Supabase SQL Editor if it is not applied by your deployment process.

alter table public.contact_messages
  alter column status set default 'Unread';

update public.contact_messages
set status = 'Unread'
where status is null or trim(status) = '';

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit support messages" on public.contact_messages;
create policy "Anyone can submit support messages"
on public.contact_messages
for insert
to anon, authenticated
with check (status = 'Unread');

drop policy if exists "Admin can read support messages" on public.contact_messages;
create policy "Admin can read support messages"
on public.contact_messages
for select
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'epictrader.support@gmail.com');

drop policy if exists "Admin can update support messages" on public.contact_messages;
create policy "Admin can update support messages"
on public.contact_messages
for update
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'epictrader.support@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'epictrader.support@gmail.com');

create index if not exists contact_messages_status_created_at_idx
on public.contact_messages (status, created_at desc);
