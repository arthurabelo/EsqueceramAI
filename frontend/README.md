# Frontend

Pasta reservada ao frontend estático do Esqueceram AI e à sua publicação na Vercel.

## Uso

Os arquivos HTML, CSS e JavaScript da interface são servidos estaticamente.
Em desenvolvimento local via Docker Compose, esta pasta é montada em read-only
no serviço `frontend` (Nginx) e disponível em <http://localhost:8080>.

O endereço da API é definido por `window.API_URL` em `app.js`, com fallback
para `http://localhost:5000`.

## Publicação na Vercel

O frontend é publicado na Vercel a partir desta pasta, como site estático:

1. Em <https://vercel.com>, clique em **Add New... → Project** e importe o
   repositório `EsqueceramAI`.
2. Em **Framework Preset**, selecione **Other** (o frontend é estático e não
   possui etapa de build).
3. Em **Root Directory**, informe `frontend`.
4. Clique em **Deploy**. Não é necessário configurar variáveis de ambiente
   para a publicação estática.
5. Após a publicação, ajuste em `app.js` (ou via `window.API_URL`) a URL base
   da API para o endereço público do backend no Render, por exemplo
   `https://seu-servico.onrender.com`.
6. No Render, configure `FRONTEND_ORIGIN` com a URL final da Vercel
   (ex.: `https://seu-site.vercel.app`) para liberar o CORS da API.

> O mapeamento das variáveis de produção (Render, Vercel, Supabase) está
> documentado na [Wiki do projeto — Tabela de Variáveis de
> Produção](https://github.com/ES2-UFPI/EsqueceramAI/wiki/Variaveis-Producao).
