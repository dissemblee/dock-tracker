import type { UserDto } from "@entities/user/user.dto";
import type { ResultDto } from "@shared/types/api";

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResultDto {
  message: string;
  user: UserDto;
}

export interface SignInResultDto {
  message: string;
  user: UserDto;
}
