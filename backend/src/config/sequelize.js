const { Sequelize } = require('sequelize');
const env = require('./env');

let sequelize;

if (env.databaseUrl) {
  sequelize = new Sequelize(env.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });
} else if (env.dbDialect === 'postgres') {
  sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'postgres',
    logging: false
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env.dbStorage,
    logging: false
  });
}

module.exports = { sequelize };
