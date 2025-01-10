import dotenv from 'dotenv';
dotenv.config({ path: __dirname.slice(0, -4) + '/.env' });
import { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DB_CONNECTION_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations:{
      directory: __dirname + '/migrations'
    }
  }
};

export default config;
