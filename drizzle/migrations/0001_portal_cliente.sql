create extension if not exists pgcrypto with schema extensions;

alter table public.empreendimentos
  add column if not exists senha_hash text,
  add column if not exists ficha_publica text not null default '',
  add column if not exists atualizacoes text not null default '';

create table public.unidades (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos(id) on delete cascade,
  identificador text not null default 'Nova unidade',
  senha_hash text,
  fotos text[] not null default '{}',
  servicos text not null default '',
  inicio date,
  conclusao date,
  atualizacoes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index unidades_empreendimento_idx on public.unidades(empreendimento_id);
grant select, insert, update, delete on public.unidades to authenticated;
grant all on public.unidades to service_role;
alter table public.unidades enable row level security;
create policy "admin all unidades" on public.unidades for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.portal_tentativas (
  id bigserial primary key,
  chave text not null,
  created_at timestamptz not null default now()
);
create index portal_tentativas_chave_idx on public.portal_tentativas(chave, created_at);
grant all on public.portal_tentativas to service_role;
alter table public.portal_tentativas enable row level security;

create or replace function public.definir_senha_obra(_id uuid, _senha text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  if _senha is null or length(_senha) < 6 then raise exception 'senha curta'; end if;
  update public.empreendimentos set senha_hash = extensions.crypt(_senha, extensions.gen_salt('bf', 10)) where id = _id;
end $$;

create or replace function public.definir_senha_unidade(_id uuid, _senha text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  if _senha is null or length(_senha) < 6 then raise exception 'senha curta'; end if;
  update public.unidades set senha_hash = extensions.crypt(_senha, extensions.gen_salt('bf', 10)) where id = _id;
end $$;

create or replace function public.portal_obra(_id uuid, _senha text, _ip text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r public.empreendimentos; k text := 'obra:' || _id || ':' || coalesce(_ip, '');
begin
  if (select count(*) from public.portal_tentativas where chave = k and created_at > now() - interval '15 minutes') >= 5 then
    return jsonb_build_object('erro', 'bloqueado');
  end if;
  select * into r from public.empreendimentos where id = _id and publicado;
  if r.id is null or r.senha_hash is null or r.senha_hash <> extensions.crypt(coalesce(_senha, ''), r.senha_hash) then
    insert into public.portal_tentativas(chave) values (k);
    return jsonb_build_object('erro', case when r.id is not null and r.senha_hash is null then 'sem_senha' else 'senha' end);
  end if;
  delete from public.portal_tentativas where chave = k;
  return jsonb_build_object(
    'titulo', r.titulo, 'cidade', r.cidade, 'endereco', r.endereco, 'status', r.status, 'etapa', r.etapa,
    'prazo', r.prazo, 'ficha', r.ficha_publica, 'atualizacoes', r.atualizacoes, 'fotos', to_jsonb(r.fotos),
    'unidades', coalesce((select jsonb_agg(jsonb_build_object('id', u.id, 'identificador', u.identificador) order by u.identificador)
      from public.unidades u where u.empreendimento_id = r.id), '[]'::jsonb));
end $$;

create or replace function public.portal_unidade(_obra uuid, _unidade uuid, _senha text, _ip text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u public.unidades; k text := 'unidade:' || _unidade || ':' || coalesce(_ip, '');
begin
  if (select count(*) from public.portal_tentativas where chave = k and created_at > now() - interval '15 minutes') >= 5 then
    return jsonb_build_object('erro', 'bloqueado');
  end if;
  select un.* into u from public.unidades un join public.empreendimentos e on e.id = un.empreendimento_id
    where un.id = _unidade and un.empreendimento_id = _obra and e.publicado;
  if u.id is null or u.senha_hash is null or u.senha_hash <> extensions.crypt(coalesce(_senha, ''), u.senha_hash) then
    insert into public.portal_tentativas(chave) values (k);
    return jsonb_build_object('erro', case when u.id is not null and u.senha_hash is null then 'sem_senha' else 'senha' end);
  end if;
  delete from public.portal_tentativas where chave = k;
  return jsonb_build_object('identificador', u.identificador, 'fotos', to_jsonb(u.fotos), 'servicos', u.servicos,
    'inicio', u.inicio, 'conclusao', u.conclusao, 'atualizacoes', u.atualizacoes);
end $$;

revoke all on function public.portal_obra(uuid, text, text) from public, anon, authenticated;
revoke all on function public.portal_unidade(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.portal_obra(uuid, text, text) to service_role;
grant execute on function public.portal_unidade(uuid, uuid, text, text) to service_role;
revoke all on function public.definir_senha_obra(uuid, text) from public, anon;
revoke all on function public.definir_senha_unidade(uuid, text) from public, anon;
grant execute on function public.definir_senha_obra(uuid, text) to authenticated;
grant execute on function public.definir_senha_unidade(uuid, text) to authenticated;