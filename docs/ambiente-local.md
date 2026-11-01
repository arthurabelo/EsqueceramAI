# Ambiente Local com Docker Compose

Este documento descreve como subir, validar e derrubar o ambiente local do
Esqueceram AI usando Docker Compose (issue [#54](https://github.com/ES2-UFPI/EsqueceramAI/issues/54)).

O arquivo `docker-compose.yaml` na raiz do projeto orquestra três serviços:

| Serviço  | Imagem / Build                  | Porta no host | Descrição                                                        |
| -------- | ------------------------------- | ------------- | ---------------------------------------------------------------- |
| `api`    | `backend/Dockerfile` (Flask + Gunicorn) | `5000`      | API REST do Esqueceram AI                                        |
| `db`     | `postgres:16-alpine`            | — (interno)   | PostgreSQL de desenvolvimento, com dados persistidos no volume `pgdata` |
| `frontend` | `nginx:alpine`                | `8080`        | Frontend estático + proxy reverso de `/api/` para a API          |

Os três serviços ficam conectados à **rede padrão do Compose** (criada
automaticamente para o projeto), e os nomes dos serviços (`api`, `db`,
`frontend`) funcionam como DNS dentro da rede.

## Pré-requisitos

- [Docker Engine](https://docs.docker.com/get-docker/) instalado;
- [Docker Compose v2](https://docs.docker.com/compose/install/) (comando `docker compose`, sem hífen).

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

Na primeira execução o Compose baixa as imagens (`postgres:16-alpine` e
`nginx:alpine`) e constrói a imagem da API a partir de `backend/Dockerfile`.

A ordem de inicialização é garantida pelo arquivo:

1. `db` sobe e passa no **healthcheck** (`pg_isready`);
2. somente então a `api` é iniciada, com a variável
   `DATABASE_URL=postgresql://postgres:postgres@db:5432/esqueceram` apontando para o serviço `db`;
3. o `frontend` sobe por último, servindo a pasta `./frontend` e fazendo proxy de `/api/` para `api:5000`.

Para rodar em segundo plano, adicione `-d`:

```bash
docker compose up --build -d
```

## Endpoints e validação

| URL                                     | O que valida                                            |
| --------------------------------------- | ------------------------------------------------------- |
| `http://localhost:5000/api/health`      | API respondendo (retorno `{"status":"healthy"}`)        |
| `http://localhost:8080`                 | Frontend sendo servido pelo Nginx                       |
| `http://localhost:8080/api/health`      | Proxy reverso do Nginx encaminhando para a API          |

Exemplos no terminal:

```bash
curl http://localhost:5000/api/health
curl http://localhost:8080/api/health
```

O status dos serviços pode ser acompanhado com:

```bash
docker compose ps
docker compose logs -f api db frontend
```

O contêiner do banco deve aparecer com status `Healthy`.

## Encerramento

Para parar os serviços **mantendo os dados do banco** no volume `pgdata`:

```bash
docker compose down
```

Para parar e **apagar os dados do PostgreSQL** (útil para começar do zero):

```bash
docker compose down -v
```

Para reconstruir a imagem da API após alterações em `backend/`:

```bash
docker compose up --build
```

## Variáveis de ambiente do ambiente local

| Variável          | Valor                              | Onde                          |
| ----------------- | ---------------------------------- | ----------------------------- |
| `PORT`            | `5000`                             | serviço `api` (o Dockerfile usa `10000` por padrão para o Render) |
| `FRONTEND_ORIGIN` | `http://localhost:8080`            | serviço `api` (CORS)          |
| `DATABASE_URL`    | `postgresql://postgres:postgres@db:5432/esqueceram` | serviço `api`    |
| `POSTGRES_USER`   | `postgres`                         | serviço `db`                  |
| `POSTGRES_PASSWORD` | `postgres`                       | serviço `db`                  |
| `POSTGRES_DB`     | `esqueceram`                       | serviço `db`                  |

> Esses valores existem apenas para o desenvolvimento local e não devem ser
> usados em produção. Veja a Wiki do projeto, página "Tabela de Variáveis de
> Produção", para o mapeamento das variáveis reais.

## Solução de problemas

| Sintoma                                        | Causa provável / correção                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `api` reiniciando antes de `db`                | Aguarde o healthcheck do banco; use `docker compose logs db`.                   |
| `5000:5000` ou `8080:80` ocupado               | Outro processo usa a porta; encerre-o ou ajuste os mapeamentos no compose.      |
| Página em `localhost:8080` não carrega o CSS   | Confira se `docker compose` foi executado na raiz do repositório.               |
| Banco com dados de uma execução anterior       | Execute `docker compose down -v` para limpar o volume.                          |
