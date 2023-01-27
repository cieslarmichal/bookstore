import { UserRole } from '../../userRole';

export interface CreateOnePayload {
  readonly id: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly password: string;
  readonly role: UserRole;
}
