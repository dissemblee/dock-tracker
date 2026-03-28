import type { EntityDto, CursorResultDto, ResultDto } from "@shared/types/api";

export interface UserDto extends EntityDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
}

export interface UserChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserCursorResultDto extends CursorResultDto<UserDto> {}

export interface UserResultDto extends ResultDto<UserDto> {}
