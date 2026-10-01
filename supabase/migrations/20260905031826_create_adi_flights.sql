-- Tabela exclusiva deste trabalho. Não altera tabelas de outros projetos.
create table if not exists public.adi_flights (
  flight_key text primary key check (flight_key ~ '^[a-f0-9]{64}$'),
  reference_date date not null,
  airline_icao text not null,
  airline text not null,
  flight_number text not null,
  leg text not null,
  origin_icao text not null check (origin_icao ~ '^[A-Z]{4}$'),
  destination_icao text not null check (destination_icao ~ '^[A-Z]{4}$'),
  departure_utc timestamptz not null,
  arrival_utc timestamptz not null,
  aircraft text not null default '',
  seats integer check (seats >= 0),
  service_type text not null default '',
  check (arrival_utc >= departure_utc)
);
create index if not exists adi_flights_origin_date_idx on public.adi_flights(origin_icao, reference_date);
create index if not exists adi_flights_destination_date_idx on public.adi_flights(destination_icao, reference_date);
alter table public.adi_flights enable row level security;
revoke all on public.adi_flights from anon, authenticated;
grant select on public.adi_flights to anon, authenticated;
grant select, insert, update on public.adi_flights to service_role;
-- Os registros são dados públicos da ANAC; somente leitura é liberada ao público.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='adi_flights' and policyname='adi_public_read') then
    create policy adi_public_read on public.adi_flights for select to anon, authenticated using (true);
  end if;
end $$;
