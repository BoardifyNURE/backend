import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteBoardDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  board_id: string;
}
