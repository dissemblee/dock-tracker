import type { UserDto } from "@entities/user/user.dto";
import type { ResultDto } from "@shared/types/api";

export interface SignInDto {
  username: string;
  password: string;
}

export interface SignUpDto {
  username: string;
  password: string;
  email?: string;
}

export interface SignUpResultDto extends ResultDto<UserDto> {}

export interface SignInResultDto {
  success: boolean;
  result: {
    token: string;
  };
}
