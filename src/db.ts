import knex from 'knex';

import { config } from './config';
import { resolve as resolvePath } from 'path';

export const db = knex({
  client: config.db.client,
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    ssl: config.db.useSSL
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  },
  migrations: {
    tableName: 'knex_migrations',
    extension: 'js',
    directory: resolvePath(__dirname, 'migrations'),
    disableMigrationsListValidation: true,
    loadExtensions: ['.js'],
  },
});

export async function migrate() {
  await db.migrate.latest({
    directory: resolvePath(__dirname, 'migrations'),
  });
}
