import { Knex } from 'knex';

const TABLE_NAME = 'todos';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('content');
    table.integer('order').notNullable();
    table.boolean('is_done');
    table
      .uuid('task_id')
      .references('id')
      .inTable('tasks')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME);
}
