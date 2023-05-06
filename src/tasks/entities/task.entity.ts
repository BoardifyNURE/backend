import { Todo } from '../../todos/entities/todo.entity';
import { Column } from '../../columns/entities/column.entity';

export class Task {
  id: string;
  title: string;
  description: string;
  order: number;
  column_id: string;

  column?: Column;
  todos?: Todo[];
}
