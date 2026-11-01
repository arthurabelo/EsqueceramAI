# Implantação em produção (GitHub Pages + Render)

Este documento descreve a publicação do **Esqueceram AI** com serviços
gratuitos: o frontend estático no **GitHub Pages** e a API Flask no **Render**.
A implantação do frontend na Vercel foi substituída pelo GitHub Pages; o
deploy do backend no Render permanece o mesmo.

| Camada   | Serviço                     | Configuração                                    | Endereço |
| -------- | --------------------------- | ----------------------------------------------- | -------- |
| Frontend | GitHub Pages                | `.github/workflows/deploy-pages.yml`            | `https://<dono>.github.io/<repositorio>/` |
| API      | Render                      | `render.yaml` + `backend/Dockerfile`            | `https://<servico>.onrender.com` |
| Banco    | PostgreSQL gerenciado       | `DATABASE_URL` no Render                        | interno  |
| Imagens  | Supabase Storage            | `SUPABASE_*` no Render                          | interno  |

## 1. Backend no Render (inalterado)

1. Em <https://render.com>, crie um **Blueprint** a partir do repositório e use
   o `render.yaml` da raiz. Ele define o serviço web `esqueceram-ai-api` com
   `runtime: docker` e `dockerfilePath: ./backend/Dockerfile`.
2. Configure as variáveis de ambiente no painel do serviço, nunca no
   repositório: `DATABASE_URL`, `STORAGE_PROVIDER=supabase`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `FRONTEND_ORIGIN` e
   as demais listadas em `backend/.env.example`.
   - `PORT` já vem definido como `10000` no `render.yaml`.
   - `FRONTEND_ORIGIN` está marcado com `sync: false`: o Blueprint não guarda
     o valor, que deve ser preenchido manualmente depois de definir a URL do
     Pages (passo 3).
3. Confira o health check: `GET https://<servico>.onrender.com/api/health`
   deve retornar `200` com `{"status":"healthy"}`.

> No plano gratuito do Render o serviço pode entrar em repouso por
> inatividade; a primeira requisição seguinte pode demorar alguns segundos.

## 2. Frontend no GitHub Pages

### Pré-requisitos

- GitHub Pages disponível para o repositório (em repositórios privados,
  verifique os recursos do plano da conta/organização);
- permissão para criar workflows e **variáveis de repositório**.

### Configuração inicial (uma vez)

1. Em **Settings → Pages → Build and deployment → Source**, selecione
   **GitHub Actions**. Não use "Deploy from a branch": os arquivos do site
   estão em `frontend/`, e a publicação por branch só serve a raiz ou `docs/`.
2. Em **Settings → Secrets and variables → Actions → Variables → New
   repository variable**, crie `PUBLIC_API_URL` com a URL base da API no
   Render, sem barra final (ex.: `https://esqueceram-ai-api.onrender.com`).
   É um valor público, não um segredo: por isso usa *variable*, não *secret*.
3. Confira se a branch padrão do repositório está entre as disparadoras do
   workflow (`dev` ou `main`). O ambiente `github-pages`, criado
   automaticamente pelo GitHub, aceita deployments apenas da branch padrão;
   se necessário, ajuste `on.push.branches` em `deploy-pages.yml` ou as regras
   de deployment desse ambiente.

### Como o deploy funciona

O workflow `.github/workflows/deploy-pages.yml`:

1. roda em pushes na branch padrão que alterem `frontend/**` ou o próprio
   workflow, e também em `workflow_dispatch` (com `api_url` opcional);
2. valida que a URL da API usa HTTPS e gera `frontend/config.js` com
   `window.API_URL = "<url do Render>"`;
3. empacota `frontend/` com `actions/upload-pages-artifact@v3` (sem build, sem
   Jekyll) e publica com `actions/deploy-pages@v5`.

O `frontend/config.js` versionado contém apenas o padrão local
`http://localhost:5000`; ele é sobrescrito no runner e nunca é commitado com a
URL de produção. Para trocar a URL, atualize `PUBLIC_API_URL` e rode o
workflow novamente.

A URL final do site é `https://<dono>.github.io/<repositorio>/` (site de
projeto) ou o domínio customizado configurado no Pages. Os arquivos usam
caminhos relativos justamente por causa do prefixo `/<repositorio>/`.

## 3. Ligação entre as duas pontas (CORS)

A API libera apenas a origem definida em `FRONTEND_ORIGIN` (ver
`backend/app.py`). No Render, configure:

| Situação                                 | Valor de `FRONTEND_ORIGIN`    |
| ---------------------------------------- | ----------------------------- |
| Site de projeto no GitHub Pages           | `https://<dono>.github.io`    |
| Domínio customizado                       | `https://seudominio.com`      |
| Desenvolvimento local (Docker Compose)    | `http://localhost:8080`       |

Use somente esquema + host (+ porta, se houver): **sem** o caminho do
repositório e **sem** barra final. `https://<dono>.github.io/EsqueceramAI/`
está errado: o cabeçalho `Origin` enviado pelo navegador é
`https://<dono>.github.io`, e o `flask-cors` compara a origem completa.

> Hoje o backend aceita uma única origem em `FRONTEND_ORIGIN`. O ambiente
> local continua com o valor definido em `docker-compose.yaml`; para liberar
> várias origens simultâneas seria preciso ajustar `backend/app.py`.

Como Pages e Render usam HTTPS, não há problema de *mixed content*; o que pode
bloquear a chamada do frontend para a API é apenas o CORS.

## 4. Verificação

| Verificação                                        | Resultado esperado |
| -------------------------------------------------- | ------------------ |
| Abrir a URL do Pages                               | Página "Esqueceram AI" com o CSS carregado |
| DevTools → Network → `config.js`                    | `window.API_URL` com a URL HTTPS do Render |
| `GET https://<servico>.onrender.com/api/health`     | `200` com `{"status":"healthy"}` |
| Chamada do Pages para `/api/*`                      | Sem erro de CORS no console; `Access-Control-Allow-Origin` igual à origem do Pages |

## 5. Solução de problemas

| Sintoma | Causa provável / correção |
| ------- | ------------------------- |
| Workflow falha pedindo `PUBLIC_API_URL` | Variável de repositório ausente ou sem `https://`; crie-a em Settings → Secrets and variables → Actions → Variables |
| "Branch is not allowed to deploy" | Execução originada de branch diferente da padrão; rode o workflow na branch padrão ou ajuste as regras do ambiente `github-pages` |
| CSS/JS com 404 no site | Caminho absoluto (ex.: `/styles.css`); use caminhos relativos por causa do prefixo do repositório |
| `config.js` com `localhost:5000` em produção | Workflow não rodou ou não gerou a configuração; confira os logs do passo "Gerar config.js com a URL da API" |
| Erro de CORS no console | `FRONTEND_ORIGIN` no Render diferente da origem do Pages (com caminho, barra final ou `http`); corrija e reinicie o serviço |
| Requisição bloqueada como *mixed content* | `PUBLIC_API_URL` usando `http://`; use a URL HTTPS do Render |
| Site não atualiza após o push | Confira se o push foi na branch padrão e alterou `frontend/**` (filtro de paths); use `workflow_dispatch` se necessário |

## Referências

- [frontend/README.md](../frontend/README.md) — uso do frontend e configuração da URL da API;
- [backend/README.md](../backend/README.md) — Dockerfile e variáveis do backend;
- [docs/ambiente-local.md](ambiente-local.md) — ambiente local com Docker Compose;
- [Wiki — Tabela de Variáveis de Produção](https://github.com/ES2-UFPI/EsqueceramAI/wiki/Variaveis-Producao) (página externa a este repositório; ainda pode citar a Vercel).
