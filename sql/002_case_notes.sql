-- Case notes on appointments (many notes per appointment, immutable log)
-- Run manually in the Supabase SQL editor (this repo has no migration tooling).

create table if not exists case_notes (
  id             uuid primary key default gen_random_uuid(),
  appointment_id text not null references appointments(id) on delete cascade,
  author_name    text not null,
  note           text not null,
  created_at     timestamptz not null default now()
);

create index if not exists case_notes_appointment_id_idx on case_notes (appointment_id);
