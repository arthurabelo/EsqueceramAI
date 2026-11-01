# Frontend

Pasta reservada ao frontend estático do Esqueceram AI, publicado no **GitHub
Pages**. A API continua no **Render** (ver
[docs/implantacao.md](../docs/implantacao.md)).

## Uso

Os arquivos HTML, CSS e JavaScript da interface são servidos estaticamente e
não possuem etapa de build. Em desenvolvimento local via Docker Compose, esta
pasta é montada em read-only no serviço `frontend` (Nginx) e disponível em
<http://localhost:8080>.

Mantenha as referências a `config.js`, `app.js` e `styles.css` como caminhos
relativos: em um site de projeto do GitHub Pages a URL inclui o nome do
repositório (ex.: `https://<dono>.github.io/EsqueceramAI/`), e caminhos
absolutos como `/app.js` apontariam para a raiz do domínio.

## URL da API

O endereço da API é lido de `window.API_URL`, definido em `config.js`, que é
carregado antes de `app.js`:

| Ambiente                 | `window.API_URL`                   | Como é definido |
| ------------------------ | ---------------------------------- | --------------- |
| Local (Docker Compose)   | `http://localhost:5000`            | Valor padrão versionado em `config.js` |
| Produção (GitHub Pages)  | `https://sua-api.onrender.com`     | `config.js` gerado pelo workflow a partir da variável de repositório `PUBLIC_API_URL` |

O GitHub Pages entrega somente arquivos estáticos: não há variáveis de ambiente
em tempo de execução nem build. Por isso o workflow escreve a URL pública da
API no `config.js` no momento do deploy. Trocar essa URL exige um novo deploy
(push na branch padrão ou execução manual do workflow).

> O Pages é servido por HTTPS; a API do Render também deve ser chamada por
> HTTPS para não ser bloqueada como *mixed content*. Nunca coloque chaves,
> tokens ou segredos em `config.js`: tudo nesta pasta é público.

## Publicação no GitHub Pages

O workflow
[`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)
publica o conteúdo desta pasta:

1. Em **Settings → Pages → Build and deployment → Source**, selecione
   **GitHub Actions** (não "Deploy from a branch": os arquivos ficam em
   `frontend/`, e a publicação por branch só serve a raiz ou `docs/`).
2. Em **Settings → Secrets and variables → Actions → Variables**, crie a
   variável de repositório `PUBLIC_API_URL` com a URL da API no Render, sem
   barra final (ex.: `https://esqueceram-ai-api.onrender.com`).
3. Envie as alterações de `frontend/` para a **branch padrão** do repositório.
   O workflow também pode ser disparado manualmente pela aba **Actions**,
   informando opcionalmente `api_url`.
4. A URL final aparece na saída do job (`page_url`):
   `https://<dono>.github.io/<repositorio>/` para sites de projeto, ou o
   domínio customizado configurado no Pages.
5. No Render, ajuste `FRONTEND_ORIGIN` para a **origem** do site, sem o caminho
   do repositório e sem barra final (ex.: `https://<dono>.github.io`), para
   liberar o CORS de `/api/*`.

> O ambiente `github-pages` criado pelo GitHub aceita deployments apenas a
> partir da branch padrão. O workflow dispara em `dev` e `main`, mas possui
> uma guarda (`if`) que ignora execuções das demais branches.

O passo a passo completo, incluindo Render, CORS e solução de problemas, está
em [docs/implantacao.md](../docs/implantacao.md).

> O mapeamento das variáveis de produção (Render, GitHub Pages, Supabase) está
> documentado na [Wiki do projeto — Tabela de Variáveis de
> Produção](https://github.com/ES2-UFPI/EsqueceramAI/wiki/Variaveis-Producao).
