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
- Public site reads projects only via the obras_publicas() RPC and photo access via foto_publicada(). Why: client data and prices never reach anonymous visitors.
