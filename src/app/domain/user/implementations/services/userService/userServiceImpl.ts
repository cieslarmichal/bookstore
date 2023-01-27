import { LoggerService } from '../../../../../libs/logger/loggerService';
import { PostgresUnitOfWork } from '../../../../../libs/unitOfWork/postgresUnitOfWork';
import { UserRepositoryFactory } from '../../../contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { HashService } from '../../../contracts/services/hashService/hashService';
import { TokenService } from '../../../contracts/services/tokenService/tokenService';
import { LoginUserByEmailData } from '../../../contracts/services/userService/loginUserByEmailData';
import { LoginUserByPhoneNumberData } from '../../../contracts/services/userService/loginUserByPhoneNumberData';
import { RegisterUserByEmailData } from '../../../contracts/services/userService/registerUserByEmailData';
import { RegisterUserByPhoneNumberData } from '../../../contracts/services/userService/registerUserByPhoneNumberData';
import { UserService } from '../../../contracts/services/userService/userService';
import { User } from '../../../contracts/user';
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

  public async registerUserByEmail(unitOfWork: PostgresUnitOfWork, userData: RegisterUserByEmailData): Promise<User> {
    const { email, password } = userData;

    this.loggerService.debug('Registering user...', { email });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const existingUser = await userRepository.findOne({ email });

    if (existingUser) {
      throw new UserAlreadyExistsError({ email });
    }

    const hashedPassword = await this.hashService.hash(password);

    const user = await userRepository.createOne({ email, password: hashedPassword });

    this.loggerService.info('User registered.', { email });

    return user;
  }

  public async registerUserByPhoneNumber(
    unitOfWork: PostgresUnitOfWork,
    userData: RegisterUserByPhoneNumberData,
  ): Promise<User> {
    const { phoneNumber, password } = userData;

    this.loggerService.debug('Registering user...', { phoneNumber });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const existingUser = await userRepository.findOne({ phoneNumber });

    if (existingUser) {
      throw new UserAlreadyExistsError({ phoneNumber });
    }

    const hashedPassword = await this.hashService.hash(password);

    const user = await userRepository.createOne({ phoneNumber, password: hashedPassword });

    this.loggerService.info('User registered.', { phoneNumber });

    return user;
  }

  public async loginUserByEmail(unitOfWork: PostgresUnitOfWork, userData: LoginUserByEmailData): Promise<string> {
    const { email, password } = userData;

    this.loggerService.debug('Logging user...', { email });

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

    this.loggerService.info('User logged in.', { email });

    return accessToken;
  }

  public async loginUserByPhoneNumber(
    unitOfWork: PostgresUnitOfWork,
    userData: LoginUserByPhoneNumberData,
  ): Promise<string> {
    const { phoneNumber, password } = userData;

    this.loggerService.debug('Logging user...', { phoneNumber });

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

    this.loggerService.info('User logged in.', { phoneNumber });

    return accessToken;
  }

  public async setPassword(unitOfWork: PostgresUnitOfWork, userId: string, newPassword: string): Promise<User> {
    this.loggerService.debug('Setting password...', { userId });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    const updatedUser = await userRepository.updateOne(userId, { password: hashedPassword });

    this.loggerService.info('Password set.', { userId });

    return updatedUser;
  }

  public async setEmail(unitOfWork: PostgresUnitOfWork, userId: string, email: string): Promise<User> {
    this.loggerService.debug('Setting email...', { userId });

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

    const updatedUser = await userRepository.updateOne(userId, { email });

    this.loggerService.info('Email set.', { userId });

    return updatedUser;
  }

  public async setPhoneNumber(unitOfWork: PostgresUnitOfWork, userId: string, phoneNumber: string): Promise<User> {
    this.loggerService.debug('Setting phone number...', { userId });

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

    const updatedUser = await userRepository.updateOne(userId, { phoneNumber });

    this.loggerService.info('Phone number set.', { userId });

    return updatedUser;
  }

  public async findUser(unitOfWork: PostgresUnitOfWork, userId: string): Promise<User> {
    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    return user;
  }

  public async removeUser(unitOfWork: PostgresUnitOfWork, userId: string): Promise<void> {
    this.loggerService.debug('Removing user...', { userId });

    const { entityManager } = unitOfWork;

    const userRepository = this.userRepositoryFactory.create(entityManager);

    await userRepository.deleteOne(userId);

    this.loggerService.info('User removed.', { userId });
  }
}
