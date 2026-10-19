<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Admin access: first account created becomes the only admin (DB trigger); login maps WhatsApp digits to a synthetic email. Why: no passwords in code, no public admin signup.
- Quote math lives in src/lib/orcamento.ts (tested); profit/taxes are spread into line values on the PDF. Why: single source of truth, profit stays hidden.
- Public site reads projects only via obras_publicas() and photo access via foto_publicada(); only empreendimentos.foto_capa is public, progress fotos are client-area only. Why: client data, prices and progress photos never reach anonymous visitors.

- Public projects use one RPC-fed carousel; ObraAtual renders a record, never static project data. Why: admin changes, publication and photo removals stay authoritative.
- Service cities share src/data/cidades.ts across the homepage and administrative selection. Why: keep supported cities consistent.
- Client portal passwords are bcrypt hashes checked only by service-role RPCs portal_obra/portal_unidade via src/lib/portal.functions.ts (attempt-limited, short signed URLs). Why: anonymous callers can never read private unit data or photos directly.
- Unit photos live under obras/<obraId>/unidades/<unitId>/ and never in empreendimentos.fotos. Why: unit photos stay private and are never mixed with public ones.
- The technical sheet initializes from the DB once, autosaves (debounced, update-by-id) and keeps a per-user localStorage draft via src/lib/rascunho.ts that wins only if newer than updated_at. Why: Android tab discards and focus refetches must never lose or overwrite edits.
