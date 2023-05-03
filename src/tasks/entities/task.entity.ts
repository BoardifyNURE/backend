import { Checklist } from '../../checklists/entities/checklist.entity';
import { Column } from '../../columns/entities/column.entity';

export class Task {
  id: string;
  title: string;
  description: string;
  order: number;
  column_id: string;

  column?: Column;
  checklists?: Checklist[];
}
