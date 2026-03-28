import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from '../../../common/constants/auth.constants';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(PASSWORD_MIN_LENGTH, { message: 'Password must be at least 8 characters' })
  @Matches(PASSWORD_REGEX, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  password!: string;
}
