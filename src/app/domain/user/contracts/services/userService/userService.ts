import { DeleteUserPayload } from './deleteUserPayload';
import { FindUserPayload } from './findUserPayload';
import { LoginUserByEmailPayload } from './loginUserByEmailPayload';
import { LoginUserByPhoneNumberPayload } from './loginUserByPhoneNumberPayload';
import { RegisterUserByEmailPayload } from './registerUserByEmailPayload';
import { RegisterUserByPhoneNumberPayload } from './registerUserByPhoneNumberPayload';
import { SetEmailPayload } from './setEmailPayload';
import { SetPasswordPayload } from './setPasswordPayload';
import { SetPhoneNumberPayload } from './setPhoneNumberPayload';
import { User } from '../../user';

export interface UserService {
  registerUserByEmail(input: RegisterUserByEmailPayload): Promise<User>;
  registerUserByPhoneNumber(input: RegisterUserByPhoneNumberPayload): Promise<User>;
  loginUserByEmail(input: LoginUserByEmailPayload): Promise<string>;
  loginUserByPhoneNumber(input: LoginUserByPhoneNumberPayload): Promise<string>;
  setPassword(input: SetPasswordPayload): Promise<User>;
  setEmail(input: SetEmailPayload): Promise<User>;
  setPhoneNumber(input: SetPhoneNumberPayload): Promise<User>;
  findUser(input: FindUserPayload): Promise<User>;
  deleteUser(input: DeleteUserPayload): Promise<void>;
}
