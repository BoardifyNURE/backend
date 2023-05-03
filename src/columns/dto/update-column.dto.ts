import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateColumnDto {
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  order?: number;
}
