import { UserRole } from '../domain/user/contracts/userRole';

export interface AccessTokenData {
  readonly userId: string;
  readonly role: UserRole;
}
