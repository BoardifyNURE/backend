import { ApiProperty } from '@nestjs/swagger';

export class UserSanitizedDto {
  @ApiProperty({
    description: 'Unique ID',
  })
  id: string;

  @ApiProperty({
    description: 'First name',
  })
  first_name: string;

  @ApiProperty({
    description: 'Last name',
  })
  last_name: string;

  @ApiProperty({
    description: 'Email address',
  })
  email: string;

  @ApiProperty({
    description: 'Username',
  })
  username: string;
}
