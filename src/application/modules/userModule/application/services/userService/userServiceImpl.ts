import { DeleteUserPayload, deleteUserPayloadSchema } from './payloads/deleteUserPayload';
import { FindUserPayload, findUserPayloadSchema } from './payloads/findUserPayload';
import { LoginUserByEmailPayload, loginUserByEmailPayloadSchema } from './payloads/loginUserByEmailPayload';
import {
  LoginUserByPhoneNumberPayload,
  loginUserByPhoneNumberPayloadSchema,
} from './payloads/loginUserByPhoneNumberPayload';
import { RegisterUserByEmailPayload, registerUserByEmailPayloadSchema } from './payloads/registerUserByEmailPayload';
import {
  RegisterUserByPhoneNumberPayload,
  registerUserByPhoneNumberPayloadSchema,
} from './payloads/registerUserByPhoneNumberPayload';
import { SetUserEmailPayload, setUserEmailPayloadSchema } from './payloads/setUserEmailPayload';
import { SetUserPasswordPayload, setUserPasswordPayloadSchema } from './payloads/setUserPasswordPayload';
import { SetUserPhoneNumberPayload, setUserPhoneNumberPayloadSchema } from './payloads/setUserPhoneNumberPayload';
import { UserService } from './userService';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../libs/validator/validator';
import { User } from '../../../domain/entities/user/user';
import { UserRole } from '../../../domain/entities/user/userRole';
import { EmailAlreadySetError } from '../../../domain/errors/emailAlreadySetError';
import { PhoneNumberAlreadySetError } from '../../../domain/errors/phoneNumberAlreadySetError';
import { UserAlreadyExistsError } from '../../../infrastructure/errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../../infrastructure/errors/userNotFoundError';
import { userModuleSymbols } from '../../../userModuleSymbols';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';
import { HashService } from '../hashService/hashService';
import { TokenService } from '../tokenService/tokenService';

@Injectable()
export class UserServiceImpl implements UserService {
  public constructor(
    @Inject(userModuleSymbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
    @Inject(userModuleSymbols.hashService)
    private readonly hashService: HashService,
    @Inject(userModuleSymbols.tokenService)
    private readonly tokenService: TokenService,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async registerUserByEmail(input: RegisterUserByEmailPayload): Promise<User> {
    const {
      unitOfWork,
      draft: { email, password },
    } = Validator.validate(registerUserByEmailPayloadSchema, input);

    this.loggerService.debug({ message: 'Registering user...', context: { email } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const existingUser = await userRepository.findOne({ email });

    if (existingUser) {
      throw new UserAlreadyExistsError({ email });
    }

    const hashedPassword = await this.hashService.hash(password);

    const user = await userRepository.createOne({
      id: UuidGenerator.generateUuid(),
      email,
      password: hashedPassword,
      role: UserRole.user,
    });

    this.loggerService.info({ message: 'User registered.', context: { email, userId: user.id } });

    return user;
  }

  public async registerUserByPhoneNumber(input: RegisterUserByPhoneNumberPayload): Promise<User> {
    const {
      unitOfWork,
      draft: { phoneNumber, password },
    } = Validator.validate(registerUserByPhoneNumberPayloadSchema, input);

    this.loggerService.debug({ message: 'Registering user...', context: { phoneNumber } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const existingUser = await userRepository.findOne({ phoneNumber });

    if (existingUser) {
      throw new UserAlreadyExistsError({ phoneNumber });
    }

    const hashedPassword = await this.hashService.hash(password);

    const user = await userRepository.createOne({
      id: UuidGenerator.generateUuid(),
      phoneNumber,
      password: hashedPassword,
      role: UserRole.user,
    });

    this.loggerService.info({ message: 'User registered.', context: { phoneNumber, userId: user.id } });

    return user;
  }

  public async loginUserByEmail(input: LoginUserByEmailPayload): Promise<string> {
    const {
      unitOfWork,
      draft: { email, password },
    } = Validator.validate(loginUserByEmailPayloadSchema, input);

    this.loggerService.debug({ message: 'Logging user in...', context: { email } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new UserNotFoundError({ email });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFoundError({ email });
    }

    const accessToken = this.tokenService.createToken({ id: user.id, role: user.role });

    this.loggerService.info({ message: 'User logged in.', context: { email, userId: user.id, accessToken } });

    return accessToken;
  }

  public async loginUserByPhoneNumber(input: LoginUserByPhoneNumberPayload): Promise<string> {
    const {
      unitOfWork,
      draft: { phoneNumber, password },
    } = Validator.validate(loginUserByPhoneNumberPayloadSchema, input);

    this.loggerService.debug({ message: 'Logging user in...', context: { phoneNumber } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ phoneNumber });

    if (!user) {
      throw new UserNotFoundError({ phoneNumber });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFoundError({ phoneNumber });
    }

    const accessToken = this.tokenService.createToken({ id: user.id, role: user.role });

    this.loggerService.info({ message: 'User logged in.', context: { phoneNumber, userId: user.id, accessToken } });

    return accessToken;
  }

  public async setUserPassword(input: SetUserPasswordPayload): Promise<User> {
    const { unitOfWork, userId, password: newPassword } = Validator.validate(setUserPasswordPayloadSchema, input);

    this.loggerService.debug({ message: 'Setting password...', context: { userId } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    const updatedUser = await userRepository.updateOne({ id: userId, draft: { password: hashedPassword } });

    this.loggerService.info({ message: 'Password set.', context: { userId } });

    return updatedUser;
  }

  public async setUserEmail(input: SetUserEmailPayload): Promise<User> {
    const { unitOfWork, userId, email } = Validator.validate(setUserEmailPayloadSchema, input);

    this.loggerService.debug({ message: 'Setting email...', context: { userId, email } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    if (user.email) {
      throw new EmailAlreadySetError({ userId, email });
    }

    const existingUserWithTargetEmail = await userRepository.findOne({ email });

    if (existingUserWithTargetEmail) {
      throw new UserAlreadyExistsError({ email });
    }

    const updatedUser = await userRepository.updateOne({ id: userId, draft: { email } });

    this.loggerService.info({ message: 'Email set.', context: { userId, email } });

    return updatedUser;
  }

  public async setUserPhoneNumber(input: SetUserPhoneNumberPayload): Promise<User> {
    const { unitOfWork, phoneNumber, userId } = Validator.validate(setUserPhoneNumberPayloadSchema, input);

    this.loggerService.debug({ message: 'Setting phone number...', context: { userId, phoneNumber } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    if (user.phoneNumber) {
      throw new PhoneNumberAlreadySetError({ userId, phoneNumber });
    }

    const existingUserWithTargetPhoneNumber = await userRepository.findOne({ phoneNumber });

    if (existingUserWithTargetPhoneNumber) {
      throw new UserAlreadyExistsError({ phoneNumber });
    }

    const updatedUser = await userRepository.updateOne({ id: userId, draft: { phoneNumber } });

    this.loggerService.info({ message: 'Phone number set.', context: { userId, phoneNumber } });

    return updatedUser;
  }

  public async findUser(input: FindUserPayload): Promise<User> {
    const { unitOfWork, userId } = Validator.validate(findUserPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    return user;
  }

  public async deleteUser(input: DeleteUserPayload): Promise<void> {
    const { unitOfWork, userId } = Validator.validate(deleteUserPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting user...', context: { userId } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    await userRepository.deleteOne({ id: userId });

    this.loggerService.info({ message: 'User deleted.', context: { userId } });
  }
}
