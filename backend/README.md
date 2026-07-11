# Flora backend

Express + Sequelize backend for Flora.

The project supports two database modes:

1. **Local demo mode:** SQLite file `dev.sqlite`. This is enabled by default so the project starts without installing PostgreSQL.
2. **Required production mode:** PostgreSQL. Enable it with `DATABASE_URL` or `DB_DIALECT=postgres` in `.env`.

## Fast local start

```bash
cd backend
npm install
npm run dev
```

The server automatically creates the database tables and seeds bouquet data if the table is empty.

Swagger UI:

```text
http://localhost:3000/api-docs
```

API JSON:

```text
http://localhost:3000/api-docs.json
```

## Local PostgreSQL start

Start PostgreSQL with Docker:

```bash
cd backend
docker compose up -d
```

Create `.env` from `.env.example` and set:

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flora_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Then run:

```bash
npm run dev
```

## Deployment

For Render or another hosting provider, set `DATABASE_URL` to the hosted PostgreSQL connection string. The app will use PostgreSQL automatically when `DATABASE_URL` exists.
