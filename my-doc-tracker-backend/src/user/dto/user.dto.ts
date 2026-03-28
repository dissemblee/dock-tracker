import { UserRole } from './user-role.enum';

export class UserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
