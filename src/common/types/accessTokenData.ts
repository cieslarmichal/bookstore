import { UserRole } from '../../application/userModule/domain/entities/user/userRole';

export interface AccessTokenData {
  readonly userId: string;
  readonly role: UserRole;
}
