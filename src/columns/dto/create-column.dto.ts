import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateColumnDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  board_id: string;

  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  order?: number;
}
