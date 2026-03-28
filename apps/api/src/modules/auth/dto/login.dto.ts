import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { PASSWORD_MIN_LENGTH } from '../../../common/constants/auth.constants';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_MIN_LENGTH, { message: 'Password is too short' })
  password!: string;
}
