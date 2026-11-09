# Migração Renovar BR: Lovable Cloud (PostgreSQL) para MySQL na Hostinger

Esta etapa é só análise. Nenhum arquivo nem banco será alterado até você aprovar a execução.

## 1. Conclusão principal sobre hospedagem

- **Hospedagem Hostinger comum (compartilhada: PHP + MySQL + phpMyAdmin) não roda este site como está.** O site usa TanStack Start, que precisa de um servidor Node.js ativo para:
  - verificar o login do admin;
  - checar as senhas do portal do cliente;
  - gerar links temporários das fotos privadas;
  - fazer a primeira montagem das páginas no servidor.
- Na hospedagem compartilhada só daria para publicar arquivos estáticos. Nesse caso, o admin e o portal ficariam sem nenhuma proteção. Isso é inaceitável.
- **Opções seguras:**
  1. **Hostinger VPS (recomendado):** Node 20+, PM2, Nginx, MySQL 8 e HTTPS com Let's Encrypt. O site roda inteiro, com a parte de servidor.
  2. **Hostinger "Node.js Web App"** (planos Business/Cloud que oferecem Node), se estiver disponível no seu plano. Precisa confirmar com a Hostinger. Funciona do mesmo jeito que o VPS, com menos controle.
  3. Reescrever toda a parte de servidor em PHP. Não recomendado: na prática é refazer o sistema.
- Depois da migração, o projeto deixa de usar o Lovable Cloud. A pré-visualização no Lovable não terá mais banco nem login funcionando, a menos que fique apontando para um MySQL acessível de fora.

## 2. Inventário do que depende do backend atual

| Área | Uso atual | Substituto em MySQL/Node |
|---|---|---|
| Login admin | e-mail sintético a partir do WhatsApp, sessão no navegador, trigger que torna admin o primeiro usuário | tabela `usuarios` com senha bcrypt, cookie de sessão httpOnly assinado, tabela `sessoes` |
| Papéis | `user_roles` + `has_role()` | tabela `user_roles` e checagem no servidor em cada função |
| Empreendimentos | tabela com RLS só para admin | mesma tabela; o acesso passa por funções de servidor protegidas |
| Unidades | tabela + senha bcrypt | mesma tabela, `senha_hash` bcrypt (os hashes atuais `$2a$` são compatíveis com bcryptjs) |
| Portal do cliente | RPCs `portal_obra` / `portal_unidade` com limite de tentativas | funções de servidor em Node, com a mesma lógica e a tabela `portal_tentativas` |
| Orçamentos | tabela `orcamentos` + `empreendimentos.custos` antigo | mesma estrutura (JSON) |
| Produtos | tabela `produtos` | mesma tabela |
| Site público | RPCs `obras_publicas()` e `foto_publicada()` | função de servidor pública que devolve só a capa |
| Fotos | área de armazenamento privada `obras`, links assinados de 10 min | pasta privada no disco do VPS, fora da pasta pública, servida por uma rota com token HMAC de validade curta |
| Ficha / autosave | update por ID direto do navegador | função de servidor `salvarFicha` protegida; o rascunho local continua igual |
| Contrato / PDF | leitura dos dados no navegador | leitura por funções de servidor; o PDF continua usando a impressão do navegador |

## 3. Esquema MySQL (será entregue como `renovar_mysql.sql` para phpMyAdmin)

MySQL 8, InnoDB, utf8mb4. IDs UUID guardados em `CHAR(36)` para manter os IDs atuais e os caminhos das fotos.

```text
usuarios(id CHAR36 PK, login VARCHAR(64) UNIQUE, senha_hash VARCHAR(100), created_at)
user_roles(id, user_id FK usuarios ON DELETE CASCADE, role ENUM('admin'), UNIQUE(user_id, role))
sessoes(id CHAR(64) PK [hash do token], user_id FK, expira_em DATETIME, created_at)
empreendimentos(id, created_at, updated_at, titulo, cidade, endereco, status, etapa,
  prazo DATE NULL, publicado TINYINT, fotos JSON, foto_capa VARCHAR(500) NULL,
  cliente JSON, dados JSON, custos JSON, senha_hash, ficha_publica TEXT, atualizacoes TEXT)
unidades(id, empreendimento_id FK CASCADE, identificador, senha_hash, fotos JSON,
  servicos TEXT, inicio DATE, conclusao DATE, atualizacoes TEXT, created_at, updated_at)
orcamentos(id, empreendimento_id FK CASCADE, titulo, custos JSON, created_at, updated_at)
produtos(id, nome, unidade, preco DOUBLE, quantidade DOUBLE, created_at, updated_at)
portal_tentativas(id BIGINT AI, chave VARCHAR(200), created_at, INDEX(chave, created_at))
```

O arquivo trará: `CREATE TABLE`, índices, `ON UPDATE CURRENT_TIMESTAMP` no `updated_at` e um usuário MySQL da aplicação com permissão só de SELECT, INSERT, UPDATE e DELETE nesse banco. Os dados vão num segundo arquivo, `renovar_dados.sql`, com os `INSERT` gerados do banco atual.

## 4. Estratégia de migração dos dados e imagens

1. Exportar cada tabela do banco atual para `INSERT`s MySQL. Os campos JSON e listas viram JSON, datas viram DATETIME em UTC, e os hashes bcrypt são copiados sem mudar.
2. **Login admin:** a senha atual fica no sistema de autenticação gerenciado, e o hash dela não pode ser exportado. Será preciso criar uma senha nova para o admin no primeiro acesso, com um script de linha de comando no VPS.
3. **Fotos:** baixar todos os arquivos da área `obras` mantendo os mesmos caminhos (`<obraId>/...` e `<obraId>/unidades/<unitId>/...`). Entregar em ZIP para enviar a `/var/renovar/uploads`.
4. Conferir as contagens de linhas e de arquivos dos dois lados, por tabela e por pasta, antes de trocar o endereço.
5. Deixar o site atual no ar até a nova versão ser validada. Depois apontar o domínio para o VPS.

## 5. Arquivos a alterar / criar no GitHub

**Criar:**
- `src/server/db.ts`: pool `mysql2`, só no servidor.
- `src/server/auth.ts`: login, sessão por cookie e verificação de admin.
- `src/server/storage.ts`: gravar e apagar arquivos e assinar links com HMAC.
- `src/lib/admin.functions.ts`: CRUD de empreendimentos, unidades, orçamentos, produtos, senhas e capa.
- `src/lib/publico.functions.ts`: `obrasPublicas`.
- `src/routes/api/arquivos.$.ts`: entrega as fotos com token válido; a capa pública só se a obra estiver publicada.
- `src/routes/api/upload.ts`: recebe as fotos (validação de tipo e de até 10 MB), só para admin.
- `scripts/criar-admin.ts`, `scripts/exportar-dados.ts`, `scripts/baixar-fotos.ts`.
- `database/renovar_mysql.sql`, `database/renovar_dados.sql`.
- `deploy/ecosystem.config.cjs` (PM2), `deploy/nginx.conf`, `DEPLOY-HOSTINGER.md`.

**Alterar:**
- `src/lib/portal.functions.ts`: trocar as RPCs por consultas MySQL e bcrypt.
- `src/routes/auth.tsx`, `src/routes/_authenticated/route.tsx`, `admin.tsx`: sessão por cookie.
- `admin.index.tsx`, `admin.$id.tsx`, `admin.$id_.orcamento.tsx`, `admin.$id_.contrato.tsx`, `admin.produtos.tsx`, `src/components/admin/Unidades.tsx`, `src/components/ObrasPublicadas.tsx`, `src/routes/__root.tsx`: usar as novas funções de servidor.
- `src/start.ts`: retirar `attachSupabaseAuth` e manter a proteção contra requisições de outros sites (CSRF).
- `vite.config.ts`: trocar o destino do build de Cloudflare para Node.
- `package.json`: incluir `mysql2` e `bcryptjs`; retirar `@supabase/supabase-js` no final.
- `AGENTS.md` e as regras do projeto: atualizar as decisões de arquitetura.

**Remover no final:** `src/integrations/supabase/*`, `supabase/`, `drizzle/`.

## 6. Variáveis de ambiente (no VPS, arquivo `.env` fora do Git)

`DATABASE_URL` (mysql://usuario:senha@localhost:3306/renovar), `SESSION_SECRET` (32+ bytes aleatórios), `FILE_SIGNING_SECRET`, `UPLOAD_DIR=/var/renovar/uploads`, `PUBLIC_SITE_URL`, `PORT=3000`, `NODE_ENV=production`.

## 7. Riscos

- **Perda de dados:** edições feitas no site atual durante a migração. Para evitar, congelar o admin, exportar e trocar no mesmo dia.
- **Senha do admin:** não pode ser migrada; será redefinida.
- **Fotos:** se algum arquivo não for baixado, a foto some. Isso é coberto pela conferência de contagens.
- **Segurança:** a proteção que hoje fica no banco (RLS) deixa de existir. Toda função de servidor precisa checar o admin, e um esquecimento expõe dados de clientes. Por isso todas as funções passarão por um único `exigirAdmin()`.
- **Operação:** backups, atualizações e HTTPS do VPS ficam por sua conta. Incluirei um script de backup diário (mysqldump + fotos).
- **Lovable:** depois da troca, a pré-visualização e a publicação pelo Lovable deixam de servir o site real.
- **Custo:** é uma tarefa grande, com muitos créditos (várias etapas). Proponho fazer por fases: 1) SQL + exportação dos dados e fotos; 2) camada de servidor e login; 3) telas do admin e portal; 4) deploy.

## Perguntas antes de executar

1. Seu plano Hostinger é compartilhado, Business com Node.js ou VPS?
2. Prefere começar só pela fase 1 (arquivos SQL para o phpMyAdmin + ZIP das fotos), sem mexer no site atual?
