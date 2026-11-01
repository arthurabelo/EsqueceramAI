# Ambiente Local com Docker Compose

Este documento descreve como **iniciar, validar e encerrar** o ambiente local
do Esqueceram AI usando Docker Compose
([issue #54](https://github.com/ES2-UFPI/EsqueceramAI/issues/54)).

O arquivo [`docker-compose.yaml`](../docker-compose.yaml) na raiz do projeto
orquestra três serviços integrados:

| Serviço    | Imagem / Build                                  | URL no host                  | Descrição                                                                    |
| ---------- | ----------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `api`      | [`backend/Dockerfile`](../backend/Dockerfile)    | <http://localhost:5000>      | API Flask/Gunicorn do Esqueceram AI (health check em `/api/health`)           |
| `db`       | `postgres:16-alpine`                            | interno (`db:5432`)          | PostgreSQL de desenvolvimento, dados persistidos no volume nomeado `pgdata`   |
| `frontend` | `nginx:alpine`                                  | <http://localhost:8080>      | Frontend estático servido pelo Nginx                                         |

Os três serviços ficam conectados à **rede padrão do Compose** (driver
`bridge`), e os nomes dos serviços (`api`, `db`, `frontend`) funcionam como
nomes de host dentro dessa rede.

## Pré-requisitos

- [Docker Engine](https://docs.docker.com/get-docker/) instalado
  (no Windows, o Docker Desktop inclui o Compose);
- Docker Compose v2 (comando `docker compose`, sem hífen).

Verifique a instalação:

```bash
docker --version
docker compose version
```

## Inicialização

Na raiz do repositório, execute:

```bash
docker compose up --build
```

Na primeira execução o Compose baixa as imagens `postgres:16-alpine` e
`nginx:alpine` e constrói a imagem da API a partir de `backend/Dockerfile`.

Para rodar em segundo plano (detached), adicione `-d`:

```bash
docker compose up --build -d
```

### Ordem de inicialização

A ordem é garantida pelo próprio arquivo:

1. o serviço `db` sobe e passa no **healthcheck** (`pg_isready`);
2. somente então a `api` é iniciada, com a variável
   `DATABASE_URL=postgresql://esqueceram_ai:esqueceram_ai@db:5432/esqueceram_ai`
   apontando para o serviço `db`;
3. o `frontend` sobe por último, servindo os arquivos de `./frontend`.

### Schema do banco

Na primeira subida (volume `pgdata` vazio), o conteúdo de `backend/sql/`
(onde está o `schema.sql`) é aplicado automaticamente pelo mecanismo
`docker-entrypoint-initdb.d` da imagem oficial do PostgreSQL. Depois disso,
os dados permanecem no volume entre execuções.

Para recriar o banco do zero (apaga os dados!):

```bash
docker compose down -v
docker compose up --build
```

## Validação

| URL                                | O que valida                                     |
| ---------------------------------- | ------------------------------------------------ |
| <http://localhost:5000/api/health> | API respondendo `{"status": "healthy"}`          |
| <http://localhost:8080>            | Frontend sendo servido pelo Nginx                |

Exemplos de validação via terminal:

```bash
# Health check da API
curl http://localhost:5000/api/health

# Frontend respondendo
curl -I http://localhost:8080
```

A API também pode ser validada pelos testes automatizados:

```bash
pytest backend/tests -q
```

## Comandos úteis

```bash
# Acompanhar os logs (todos os servicos)
docker compose logs -f

# Logs de um servico especifico
docker compose logs -f api

# Abrir um psql dentro do banco
docker compose exec db psql -U esqueceram_ai -d esqueceram_ai

# Listar os containers em execucao
docker compose ps

# Parar e reconstruir apos mudar o codigo do backend
docker compose up --build -d
```

## Variáveis de ambiente

| Variável                    | Serviço   | Valor padrão no Compose                                              | Descrição                                              |
| --------------------------- | --------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`              | `api`     | `postgresql://esqueceram_ai:esqueceram_ai@db:5432/esqueceram_ai`     | Conexão da API com o PostgreSQL (host `db` na rede)    |
| `FRONTEND_ORIGIN`           | `api`     | `http://localhost:8080`                                              | Origem liberada no CORS da API                         |
| `POSTGRES_USER`             | `db`      | `esqueceram_ai`                                                      | Usuário criado no PostgreSQL (somente desenvolvimento) |
| `POSTGRES_PASSWORD`         | `db`      | `esqueceram_ai`                                                      | Senha do usuário (somente desenvolvimento)             |
| `POSTGRES_DB`               | `db`      | `esqueceram_ai`                                                      | Banco criado na primeira subida                        |

As credenciais do banco existem **apenas para o ambiente local** e não devem
ser reutilizadas em produção (em produção usa-se a string de conexão do
Supabase configurada nos secrets do Render).

## Encerramento

```bash
# Encerra os servicos (os dados do banco permanecem no volume pgdata)
docker compose down

# Encerra os servicos e APAGA os dados do PostgreSQL
docker compose down -v
```

## Solução de problemas

- **Porta 5000 ou 8080 já está em uso** — altere o mapeamento no
  `docker-compose.yaml` (por exemplo, `"5001:10000"`) ou finalize o processo
  que ocupa a porta.
- **Conflito com um PostgreSQL local** — por padrão o Compose não publica a
  porta 5432 do banco; se você tiver descomentado o mapeamento
  `"5432:5432"` e já existir um PostgreSQL local, comente-o novamente.
- **Mudanças no backend não aparecem** — a imagem da API é construída com
  `--build`; rode `docker compose up --build -d` após alterar o código.
- **Banco em estado inconsistente** — `docker compose down -v` seguido de
  `docker compose up --build` recria o volume e reaplica o `schema.sql`.
- **Windows: problemas de permissão no bind mount de `./frontend`** — ative
  a compartilhamento de drive no Docker Desktop ou troque o bind mount por
  uma imagem que copie os arquivos (build próprio do frontend).

## Estrutura dos arquivos

```text
docker-compose.yaml        # orquestracao dos servicos (raiz do projeto)
.dockerignore              # mantem o contexto de build enxuto
backend/Dockerfile         # imagem da API (contexto de build = raiz)
backend/sql/schema.sql     # schema aplicado automaticamente na primeira subida
frontend/                  # arquivos estaticos servidos pelo Nginx
docs/ambiente-local.md     # este documento
```
