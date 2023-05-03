import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteTaskDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  task_id: string;
}
