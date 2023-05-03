import { Board } from '../../boards/entities/board.entity';
import { Task } from '../../tasks/entities/task.entity';

export class Column {
  id: string;
  title: string;
  order: number;
  board_id: string;

  board?: Board;
  tasks?: Task[];
}
