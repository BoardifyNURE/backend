import { Knex } from 'knex';

import { TaskStatus } from '../tasks/enums/task-status.enum';

const TABLE_NAME = 'tasks';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table
      .enum('status', Object.values(TaskStatus))
      .notNullable()
      .defaultTo(TaskStatus.ToDo);
    table
      .uuid('assignee_id')
      .references('id')
      .inTable('users')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumns('status', 'assignee_id');
  });
}
