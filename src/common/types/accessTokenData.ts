import { UserRole } from '../../app/userModule/domain/entities/user/userRole';

export interface AccessTokenData {
  readonly userId: string;
  readonly role: UserRole;
}
