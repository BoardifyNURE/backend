import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const config = {
  port: parseInt(process.env.PORT) ?? 5000,

  db: {
    client: 'pg',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) ?? 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'lolkek',
  },
};
