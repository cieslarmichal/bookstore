import { LoggerService } from '../../../../../libs/logger/loggerService';
import { UuidGenerator } from '../../../../../libs/uuid/uuidGenerator';
import { UserRepositoryFactory } from '../../../contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../contracts/services/hashService/hashService';
import { TokenService } from '../../../contracts/services/tokenService/tokenService';
import { DeleteUserPayload } from '../../../contracts/services/userService/deleteUserPayload';
import { FindUserPayload } from '../../../contracts/services/userService/findUserPayload';
import { LoginUserByEmailPayload } from '../../../contracts/services/userService/loginUserByEmailPayload';
import { LoginUserByPhoneNumberPayload } from '../../../contracts/services/userService/loginUserByPhoneNumberPayload';
import { RegisterUserByEmailPayload } from '../../../contracts/services/userService/registerUserByEmailPayload';
import { RegisterUserByPhoneNumberPayload } from '../../../contracts/services/userService/registerUserByPhoneNumberPayload';
import { SetEmailPayload } from '../../../contracts/services/userService/setEmailPayload';
import { SetPasswordPayload } from '../../../contracts/services/userService/setPasswordPayload';
import { SetPhoneNumberPayload } from '../../../contracts/services/userService/setPhoneNumberPayload';
import { UserService } from '../../../contracts/services/userService/userService';
import { User } from '../../../contracts/user';
import { UserRole } from '../../../contracts/userRole';
import { EmailAlreadySetError } from '../../../errors/emailAlreadySetError';
import { PhoneNumberAlreadySetError } from '../../../errors/phoneNumberAlreadySetError';
import { UserAlreadyExistsError } from '../../../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../../errors/userNotFoundError';

export class UserServiceImpl implements UserService {
  public constructor(
    private readonly userRepositoryFactory: UserRepositoryFactory,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly loggerService: LoggerService,
  ) {}

  public async registerUserByEmail(input: RegisterUserByEmailPayload): Promise<User> {
    const {
      unitOfWork,
      draft: { email, password },
    } = input;

    this.loggerService.debug('Registering user...', { email });

    const { entityManager } = unitOfWork;

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

    this.loggerService.info('User registered.', { email, userId: user.id });

    return user;
  }

  public async registerUserByPhoneNumber(input: RegisterUserByPhoneNumberPayload): Promise<User> {
    const {
      unitOfWork,
      draft: { phoneNumber, password },
    } = input;

    this.loggerService.debug('Registering user...', { phoneNumber });

    const { entityManager } = unitOfWork;

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

    this.loggerService.info('User registered.', { phoneNumber, userId: user.id });

    return user;
  }

  public async loginUserByEmail(input: LoginUserByEmailPayload): Promise<string> {
    const {
      unitOfWork,
      draft: { email, password },
    } = input;

    this.loggerService.debug('Logging user in...', { email });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new UserNotFoundError({ email });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFoundError({ email });
    }

    const accessToken = await this.tokenService.createToken({ id: user.id, role: user.role });

    this.loggerService.info('User logged in.', { email, userId: user.id, accessToken });

    return accessToken;
  }

  public async loginUserByPhoneNumber(input: LoginUserByPhoneNumberPayload): Promise<string> {
    const {
      unitOfWork,
      draft: { phoneNumber, password },
    } = input;

    this.loggerService.debug('Logging user in...', { phoneNumber });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ phoneNumber });

    if (!user) {
      throw new UserNotFoundError({ phoneNumber });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFoundError({ phoneNumber });
    }

    const accessToken = await this.tokenService.createToken({ id: user.id, role: user.role });

    this.loggerService.info('User logged in.', { phoneNumber, userId: user.id, accessToken });

    return accessToken;
  }

  public async setPassword(input: SetPasswordPayload): Promise<User> {
    const { unitOfWork, userId, password: newPassword } = input;

    this.loggerService.debug('Setting password...', { userId });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    const updatedUser = await userRepository.updateOne({ id: userId, draft: { password: hashedPassword } });

    this.loggerService.info('Password set.', { userId });

    return updatedUser;
  }

  public async setEmail(input: SetEmailPayload): Promise<User> {
    const { unitOfWork, userId, email } = input;

    this.loggerService.debug('Setting email...', { userId, email });

    const { entityManager } = unitOfWork;

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

    this.loggerService.info('Email set.', { userId, email });

    return updatedUser;
  }

  public async setPhoneNumber(input: SetPhoneNumberPayload): Promise<User> {
    const { unitOfWork, phoneNumber, userId } = input;

    this.loggerService.debug('Setting phone number...', { userId, phoneNumber });

    const { entityManager } = unitOfWork;

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

    this.loggerService.info('Phone number set.', { userId, phoneNumber });

    return updatedUser;
  }

  public async findUser(input: FindUserPayload): Promise<User> {
    const { unitOfWork, userId } = input;

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    return user;
  }

  public async deleteUser(input: DeleteUserPayload): Promise<void> {
    const { unitOfWork, userId } = input;

    this.loggerService.debug('Deleting user...', { userId });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    await userRepository.deleteOne({ id: userId });

    this.loggerService.info('User deleted.', { userId });
  }
}
