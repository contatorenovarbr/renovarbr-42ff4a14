alter table public.empreendimentos add column if not exists foto_capa text;
update public.empreendimentos set foto_capa = fotos[1] where foto_capa is null and cardinality(fotos) > 0;

-- Public card shows only the cover photo; progress photos are only for the client area.
create or replace function public.obras_publicas()
 returns table(id uuid, titulo text, cidade text, endereco text, status text, etapa text, prazo date, fotos text[])
 language sql stable security definer set search_path to 'public'
as $$
  select id, titulo, cidade, endereco, status, etapa, prazo,
    case when foto_capa is not null then array[foto_capa] else '{}'::text[] end
  from public.empreendimentos where publicado order by created_at desc
$$;

create or replace function public.foto_publicada(_path text)
 returns boolean language sql stable security definer set search_path to 'public'
as $$
  select exists (select 1 from public.empreendimentos where publicado and foto_capa = _path)
$$;