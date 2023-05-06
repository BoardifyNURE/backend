import { Knex } from 'knex';

const TABLE_NAME = 'boards_users';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table
      .uuid('board_id')
      .references('id')
      .inTable('boards')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table
      .uuid('user_id')
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME);
}
