import { Knex } from 'knex';

const TABLE_NAME = 'tasks';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title');
    table.text('description');
    table.integer('order').notNullable();
    table
      .uuid('column_id')
      .references('id')
      .inTable('columns')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME);
}
