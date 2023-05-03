import { Knex } from 'knex';

const TABLE_NAME = 'checklists';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').unique();
    table.string('password_hash');
    table.string('first_name');
    table.string('last_name');
    table.string('username').unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME);
}
