import { UserRole } from '../domain/user/contracts/userRole';

export interface AuthTokenData {
  readonly userId: string;
  readonly role: UserRole;
}
