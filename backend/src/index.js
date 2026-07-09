const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const { seedDatabase } = require('./db/initDb');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.info('Database connection successful');
    await sequelize.sync();
    await seedDatabase();

    app.listen(env.port, () => {
      console.info(`Flora backend is running on port ${env.port}`);
      console.info(`Swagger UI: http://localhost:${env.port}/api-docs`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
