-- Pharmacist profiles shown on the homepage (uploaded from the admin dashboard)
create table if not exists pharmacists (
  id             bigint generated always as identity primary key,
  name           text not null,
  specialization text,
  photo_url      text,
  bio            text,
  sort_order     integer default 0,
  is_active      boolean default true,
  created_at     timestamptz default now() not null
);
alter table pharmacists enable row level security;
drop policy if exists pharmacists_read on pharmacists;
drop policy if exists pharmacists_write on pharmacists;
drop policy if exists pharmacists_update on pharmacists;
drop policy if exists pharmacists_delete on pharmacists;
create policy pharmacists_read   on pharmacists for select using (true);
create policy pharmacists_write  on pharmacists for insert with check (true);
create policy pharmacists_update on pharmacists for update using (true) with check (true);
create policy pharmacists_delete on pharmacists for delete using (true);
