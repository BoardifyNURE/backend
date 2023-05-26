import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
} from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  column_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional()
  assignee_id?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  order?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;
}
