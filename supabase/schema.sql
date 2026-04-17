-- Wang Work Brain: schema
-- Run this in the Supabase SQL editor to create the projects table.

create extension if not exists "uuid-ossp";

create table if not exists public.projects (
  id          text primary key,
  title       text not null,
  tagline     text default '',
  category    text not null default 'misc'
              check (category in ('photo', 'hair', 'weddings', 'misc')),
  status      text not null default 'idea'
              check (status in ('idea', 'building', 'live', 'shelved')),
  stack       text[] default '{}',
  links       jsonb  default '{}'::jsonb,
  related     text[] default '{}',
  next_action text   default '',
  notes       text   default '',
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

-- MVP RLS: enable but allow anon read + writes. Tighten once auth is added.
alter table public.projects enable row level security;

drop policy if exists "anon read projects"  on public.projects;
drop policy if exists "anon write projects" on public.projects;

create policy "anon read projects"
  on public.projects for select
  using (true);

create policy "anon write projects"
  on public.projects for all
  using (true)
  with check (true);

-- When you add auth later, replace the anon policies with something like:
--   using  (auth.email() in ('jordan@example.com','marco@example.com'))
--   with check (...)
