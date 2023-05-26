import { Todo } from '../../todos/entities/todo.entity';
import { Column } from '../../columns/entities/column.entity';
import { TaskStatus } from '../enums/task-status.enum';

export class Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_id?: string;
  order: number;
  column_id: string;

  column?: Column;
  todos?: Todo[];
}
