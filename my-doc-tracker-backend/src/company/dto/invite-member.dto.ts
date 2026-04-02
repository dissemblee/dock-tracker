import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteMemberDto {
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;
}

export class FindUserByEmailDto {
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;
}
