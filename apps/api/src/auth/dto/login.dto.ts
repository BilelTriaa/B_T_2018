import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'bilel.triaa@rosenberger.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AXIOME2026!' })
  @IsString()
  @MinLength(6)
  password: string;
}
