import type { EntityDto, ResultDto } from "@shared/types/api";
import type { UserDto } from "@entities/user";

export interface CompanyDto extends EntityDto {
  id: number;
  name: string;
  inn?: string | null;
  ogrn?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoKey?: string | null;
}

export interface CompanyWithMembersDto extends CompanyDto {
  users?: UserDto[];
}

export interface CompanyCreateDto {
  name: string;
  inn?: string;
  ogrn?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoKey?: string;
}

export interface CompanyUpdateDto {
  name?: string;
  inn?: string;
  ogrn?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoKey?: string;
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

/** Участник компании (из таблицы company_members) */
export interface CompanyMemberDto extends EntityDto {
  id: number;
  userId: number;
  companyId: number;
  role: "owner" | "admin" | "member";
  invitedAt?: string | null;
  acceptedAt?: string | null;
  inviteEmail?: string | null;
  user?: UserDto;
}

/** Данные компании с участниками (новый эндпоинт) */
export interface CompanyFullDto extends CompanyDto {
  members?: CompanyMemberDto[];
}
