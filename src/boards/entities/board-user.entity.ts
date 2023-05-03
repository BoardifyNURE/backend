import { Board } from './board.entity';
import { User } from '../../users/entities/user.entity';

export class BoardUser {
  board_id: string;
  user_id: string;

  board?: Board;
  user?: User;
}
