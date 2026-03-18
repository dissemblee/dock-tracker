import type { EntityDto, CursorResultDto, ResultDto } from "@shared/types/api";

export interface UserDto extends EntityDto {
  username: string;
  email?: string;
}

export interface UserUpdateDto {
  email?: string;
}

export interface UserChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserCursorResultDto extends CursorResultDto<UserDto> {}

export interface UserResultDto extends ResultDto<UserDto> {}
