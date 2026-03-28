import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../../../common/constants/auth.constants';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @Length(USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, {
    message: 'Username should contain at least 2 (up to 20) characters',
  })
  username!: string;

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
