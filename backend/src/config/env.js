require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 3000,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',

  // Local development starts without an external database by using SQLite.
  // For the required PostgreSQL mode set DB_DIALECT=postgres or provide DATABASE_URL.
  dbDialect: process.env.DB_DIALECT || (process.env.DATABASE_URL ? 'postgres' : 'sqlite'),
  databaseUrl: process.env.DATABASE_URL || '',
  dbStorage: process.env.DB_STORAGE || 'dev.sqlite',

  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: Number(process.env.DB_PORT) || 5432,
  dbName: process.env.DB_NAME || 'flora_db',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'postgres'
};

module.exports = env;
