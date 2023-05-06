import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateTodoDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  task_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional()
  order?: number;
}
