import { Checklist } from './checklist.entity';

export class ChecklistItem {
  id: string;
  content: string;
  is_checked: boolean;
  checklist_id: string;

  checklist?: Checklist;
}
