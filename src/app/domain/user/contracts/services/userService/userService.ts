import { LoginUserByEmailData } from './loginUserByEmailData';
import { LoginUserByPhoneNumberData } from './loginUserByPhoneNumberData';
import { RegisterUserByEmailData } from './registerUserByEmailData';
import { RegisterUserByPhoneNumberData } from './registerUserByPhoneNumberData';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { User } from '../../user';

export interface UserService {
  registerUserByEmail(unitOfWork: PostgresUnitOfWork, userData: RegisterUserByEmailData): Promise<User>;
  registerUserByPhoneNumber(unitOfWork: PostgresUnitOfWork, userData: RegisterUserByPhoneNumberData): Promise<User>;
  loginUserByEmail(unitOfWork: PostgresUnitOfWork, userData: LoginUserByEmailData): Promise<string>;
  loginUserByPhoneNumber(unitOfWork: PostgresUnitOfWork, userData: LoginUserByPhoneNumberData): Promise<string>;
  setPassword(unitOfWork: PostgresUnitOfWork, userId: string, newPassword: string): Promise<User>;
  setEmail(unitOfWork: PostgresUnitOfWork, userId: string, email: string): Promise<User>;
  setPhoneNumber(unitOfWork: PostgresUnitOfWork, userId: string, phoneNumber: string): Promise<User>;
  findUser(unitOfWork: PostgresUnitOfWork, userId: string): Promise<User>;
  removeUser(unitOfWork: PostgresUnitOfWork, userId: string): Promise<void>;
}
