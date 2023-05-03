import { Column } from '../../columns/entities/column.entity';

export class Board {
  id: string;
  title: string;

  columns?: Column[];
}
