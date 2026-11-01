# Frontend

Pasta reservada ao frontend estático do Esqueceram AI e à sua publicação no
GitHub Pages.

## Uso

Os arquivos HTML, CSS e JavaScript da interface são servidos estaticamente.
Em desenvolvimento local via Docker Compose, esta pasta é montada em read-only
no serviço `frontend` (Nginx) e disponível em <http://localhost:8080>.

O endereço da API é definido por `window.API_URL` em `app.js`, com fallback
por ambiente:

- **GitHub Pages** (produção): usa `PRODUCTION_API_URL`, a URL pública do
  backend no Render;
- **desenvolvimento local**: usa `http://localhost:5000`.

## Publicação no GitHub Pages

O deploy é automatizado pelo workflow
[.github/workflows/deploy-pages.yml](../.github/workflows/deploy-pages.yml),
que publica o conteúdo desta pasta no GitHub Pages sempre que houver push na
branch `dev` (também pode ser executado manualmente pelo botão "Run workflow"
da aba Actions).

Passo a passo:

1. Em **Settings → Pages**, configure **Build and deployment → Source** como
   **GitHub Actions** (uma única vez).
2. Após o primeiro deploy, o site fica disponível em
   `https://arthurabelo.github.io/EsqueceramAI/`.
3. Depois de criar o serviço no Render, ajuste `PRODUCTION_API_URL` em
   `frontend/app.js` com a URL pública do backend
   (ex.: `https://esqueceram-ai-api.onrender.com`).
4. No Render, configure `FRONTEND_ORIGIN=https://arthurabelo.github.io` para
   liberar o CORS da API para o site publicado.

> O mapeamento das variáveis de produção (Render, GitHub Pages, Supabase)
> está documentado na [Wiki do projeto — Tabela de Variáveis de
> Produção](https://github.com/ES2-UFPI/EsqueceramAI/wiki/Variaveis-Producao).
