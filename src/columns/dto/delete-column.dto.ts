import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteColumnDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  column_id: string;
}
