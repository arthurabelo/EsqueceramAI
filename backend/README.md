# Backend

Pasta reservada ao backend do Esqueceram AI e à sua publicação no Render
(serviço Docker). O frontend, por sua vez, é publicado no GitHub Pages.

## Uso

O `Dockerfile` define a base de publicação e expõe a porta `10000`, conforme
exigido pelo Render. O Blueprint `render.yaml`, na raiz do repositório, cria o
serviço web `esqueceram-ai-api` com `runtime: docker`. A API, suas
dependências e seus endpoints serão adicionados em issues específicas.

## Variáveis de ambiente

As variáveis de ambiente de produção devem ser configuradas no serviço de
publicação, nunca versionadas no repositório (use `backend/.env.example` como
referência de nomes e valores fictícios).

| Variável           | Exemplo                            | Observação |
| ------------------ | ---------------------------------- | ---------- |
| `PORT`             | `10000`                            | Já definida no `render.yaml`. |
| `FRONTEND_ORIGIN`  | `https://<dono>.github.io`         | Origem do frontend no GitHub Pages; libera o CORS de `/api/*`. Sem caminho do repositório e sem barra final. |
| `DATABASE_URL`     | `postgresql://...`                 | PostgreSQL gerenciado. |
| `SUPABASE_*`       | `https://<projeto>.supabase.co`    | Armazenamento das imagens no plano gratuito. |

O `FRONTEND_ORIGIN` está no `render.yaml` com `sync: false`: o valor depende
do domínio final do site e deve ser preenchido manualmente no painel do
Render. Hoje a API aceita uma única origem por vez; o ambiente local usa
`http://localhost:8080`, definido no `docker-compose.yaml`.

Consulte [docs/implantacao.md](../docs/implantacao.md) para o passo a passo de
publicação e a integração com o GitHub Pages.
