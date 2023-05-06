import { Task } from '../../tasks/entities/task.entity';

export class Todo {
  id: string;
  content: string;
  order: number;
  is_done: boolean;
  task_id: string;

  task?: Task;
}
