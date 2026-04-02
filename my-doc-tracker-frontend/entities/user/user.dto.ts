import type { EntityDto, CursorResultDto, ResultDto } from "@shared/types/api";

export interface UserDto extends EntityDto {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId?: number | null;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  password?: string;
  companyId?: number | null;
}

export interface UserChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserCursorResultDto extends CursorResultDto<UserDto> {}

export interface UserResultDto extends ResultDto<UserDto> {}

export interface SearchUserDto {
  id: number;
  name: string;
  email: string;
  companyId: number | null;
}
