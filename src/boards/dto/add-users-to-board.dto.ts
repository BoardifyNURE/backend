import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AddUserToBoardIdentification {
  @IsOptional()
  @ApiPropertyOptional()
  user_id?: string;

  @IsOptional()
  @IsEmail()
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
  @ValidateNested({ each: true })
  @Type(() => AddUserToBoardIdentification)
  @ApiProperty({ type: [AddUserToBoardIdentification] })
  users_identifications: AddUserToBoardIdentification[];
}
