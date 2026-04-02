import type { EntityDto, ResultDto } from "@shared/types/api";
import type { UserDto } from "@entities/user";

export interface CompanyDto extends EntityDto {
  id: number;
  name: string;
  inn?: string | null;
}

export interface CompanyWithMembersDto extends CompanyDto {
  users?: UserDto[];
}

export interface CompanyCreateDto {
  name: string;
  inn?: string;
}

export interface CompanyUpdateDto {
  name?: string;
  inn?: string;
}

export interface CompanyResultDto extends ResultDto<CompanyDto> {}

export interface CompanyMembersResultDto extends ResultDto<UserDto[]> {}

export interface InviteMemberDto {
  email: string;
}

export interface SearchUserResultDto {
  id: number;
  name: string;
  email: string;
  companyId: number | null;
}
