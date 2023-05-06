import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class UpdateTodoDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  is_done?: boolean;
}
