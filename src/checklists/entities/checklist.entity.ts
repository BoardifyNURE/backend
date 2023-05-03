import { Task } from '../../tasks/entities/task.entity';
import { ChecklistItem } from './checklist-item.entity';

export class Checklist {
  id: string;
  title: string;
  task_id: string;

  task?: Task;
  items?: ChecklistItem[];
}
