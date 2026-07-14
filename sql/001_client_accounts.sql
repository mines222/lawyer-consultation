-- Client accounts + consultation history
-- Run manually in the Supabase SQL editor (this repo has no migration tooling).

create table if not exists clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  phone         text,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create index if not exists clients_email_idx on clients (email);

alter table appointments
  add column if not exists client_id uuid references clients(id) on delete set null;

create index if not exists appointments_client_id_idx on appointments (client_id);
