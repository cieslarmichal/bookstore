import { DeleteUserPayload } from './deleteUserPayload';
import { FindUserPayload } from './findUserPayload';
import { LoginUserByEmailPayload } from './loginUserByEmailPayload';
import { LoginUserByPhoneNumberPayload } from './loginUserByPhoneNumberPayload';
import { RegisterUserByEmailPayload } from './registerUserByEmailPayload';
import { RegisterUserByPhoneNumberPayload } from './registerUserByPhoneNumberPayload';
import { SetUserEmailPayload } from './setUserEmailPayload';
import { SetUserPasswordPayload } from './setUserPasswordPayload';
import { SetUserPhoneNumberPayload } from './setUserPhoneNumberPayload';
import { User } from '../../user';

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
