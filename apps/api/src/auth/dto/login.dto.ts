import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@rosenberger.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'OTTO2026!' })
  @IsString()
  @MinLength(6)
  password: string;
}
