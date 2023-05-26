import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsUUID, IsEnum } from 'class-validator';

import { TaskStatus } from '../enums/task-status.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  @ApiPropertyOptional()
  status?: TaskStatus;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional()
  assignee_id?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  order?: number;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional()
  column_id?: string;
}
