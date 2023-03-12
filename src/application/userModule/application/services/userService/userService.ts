import { DeleteUserPayload } from './payloads/deleteUserPayload';
import { FindUserPayload } from './payloads/findUserPayload';
import { LoginUserByEmailPayload } from './payloads/loginUserByEmailPayload';
import { LoginUserByPhoneNumberPayload } from './payloads/loginUserByPhoneNumberPayload';
import { RegisterUserByEmailPayload } from './payloads/registerUserByEmailPayload';
import { RegisterUserByPhoneNumberPayload } from './payloads/registerUserByPhoneNumberPayload';
import { SetUserEmailPayload } from './payloads/setUserEmailPayload';
import { SetUserPasswordPayload } from './payloads/setUserPasswordPayload';
import { SetUserPhoneNumberPayload } from './payloads/setUserPhoneNumberPayload';
import { User } from '../../../domain/entities/user/user';

export interface UserService {
  registerUserByEmail(input: RegisterUserByEmailPayload): Promise<User>;
  registerUserByPhoneNumber(input: RegisterUserByPhoneNumberPayload): Promise<User>;
  loginUserByEmail(input: LoginUserByEmailPayload): Promise<string>;
  loginUserByPhoneNumber(input: LoginUserByPhoneNumberPayload): Promise<string>;
  setUserPassword(input: SetUserPasswordPayload): Promise<User>;
  setUserEmail(input: SetUserEmailPayload): Promise<User>;
  setUserPhoneNumber(input: SetUserPhoneNumberPayload): Promise<User>;
  findUser(input: FindUserPayload): Promise<User>;
  deleteUser(input: DeleteUserPayload): Promise<void>;
}
