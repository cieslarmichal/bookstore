import { CreateUserPayload } from './payloads/createUserPayload';
import { DeleteUserPayload } from './payloads/deleteUserPayload';
import { FindUserPayload } from './payloads/findUserPayload';
import { UpdateUserPayload } from './payloads/updateUserPayload';
import { User } from '../../../domain/entities/user/user';

export interface UserRepository {
  createUser(input: CreateUserPayload): Promise<User>;
  findUser(input: FindUserPayload): Promise<User | null>;
  updateUser(input: UpdateUserPayload): Promise<User>;
  deleteUser(input: DeleteUserPayload): Promise<void>;
}
