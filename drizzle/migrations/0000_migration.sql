create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.admin_exists() to anon, authenticated;

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.handle_first_admin();

create table public.empreendimentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  titulo text not null default 'Novo empreendimento',
  cidade text not null default '',
  endereco text not null default '',
  status text not null default 'Orçamento',
  etapa text not null default '',
  prazo date,
  publicado boolean not null default false,
  fotos text[] not null default '{}',
  cliente jsonb not null default '{}',
  dados jsonb not null default '{}',
  custos jsonb not null default '{}'
);
grant select, insert, update, delete on public.empreendimentos to authenticated;
grant all on public.empreendimentos to service_role;
alter table public.empreendimentos enable row level security;
create policy "admin all" on public.empreendimentos for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.obras_publicas()
returns table (id uuid, titulo text, cidade text, endereco text, status text, etapa text, prazo date, fotos text[])
language sql stable security definer set search_path = public as $$
  select id, titulo, cidade, endereco, status, etapa, prazo, fotos
  from public.empreendimentos where publicado order by created_at desc
$$;
grant execute on function public.obras_publicas() to anon, authenticated;

create or replace function public.foto_publicada(_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.empreendimentos where publicado and _path = any(fotos))
$$;
grant execute on function public.foto_publicada(text) to anon, authenticated;

create policy "obras read" on storage.objects for select
  using (bucket_id = 'obras' and (public.foto_publicada(name) or public.has_role(auth.uid(), 'admin')));
create policy "obras admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'obras' and public.has_role(auth.uid(), 'admin'));
create policy "obras admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'obras' and public.has_role(auth.uid(), 'admin'));