require('dotenv').config();
const path = require('path');

const connection = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'booking_system',
};

/** @type { import('knex').Knex.Config } */
const sharedMigrations = {
  tableName: 'migrations',
};

module.exports = {
  development: {
    client: 'pg',
    connection,
    migrations: {
      ...sharedMigrations, 
      directory: path.join(__dirname, 'src/database/migrations'),
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
  },
  production: {
    client: 'pg',
    connection,
    migrations: {
      ...sharedMigrations,
      directory: path.join(__dirname, 'dist/database/migrations'),
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
  },
};
