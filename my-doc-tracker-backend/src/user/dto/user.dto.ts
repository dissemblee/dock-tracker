import { UserRole } from "./user-role.enum";

export class UserDto {
  email: string;
  role: UserRole;
}
