import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AddUserToBoardIdentification {
  @IsOptional()
  @ApiPropertyOptional()
  user_id?: string;

  @IsOptional()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @ApiPropertyOptional()
  username?: string;
}

export class AddUsersToBoardDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  board_id: string;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ type: [AddUserToBoardIdentification] })
  users_identifications: AddUserToBoardIdentification[];
}
