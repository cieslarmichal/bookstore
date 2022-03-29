import { LoggerService } from '../../../shared/logger/services/loggerService';
import { UserDto } from '../dtos';
import { UserAlreadyExists, UserNotFound } from '../errors';
import { UserRepository } from '../repositories/userRepository';
import { HashService } from './hashService';
import { TokenService } from './tokenService';
import {
  RegisterUserByEmailData,
  LoginUserByEmailData,
  RegisterUserByPhoneNumberData,
  LoginUserByPhoneNumberData,
} from './types';

export type AccessToken = string;

export class UserService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly loggerService: LoggerService,
  ) {}

  public async registerUserByEmail(userData: RegisterUserByEmailData): Promise<UserDto> {
    const { email, password } = userData;

    this.loggerService.debug('Registering user...', { email });

    const existingUser = await this.userRepository.findOne({ email });

    if (existingUser) {
      throw new UserAlreadyExists({ email });
    }

    const hashedPassword = await this.hashService.hash(password);

    const user = await this.userRepository.createOne({ email, password: hashedPassword });

    this.loggerService.info('User registered.', { email });

    return user;
  }

  public async registerUserByPhoneNumber(userData: RegisterUserByPhoneNumberData) {
    const { phoneNumber, password } = userData;

    this.loggerService.debug('Registering user...', { phoneNumber });

    const existingUser = await this.userRepository.findOne({ phoneNumber });

    if (existingUser) {
      throw new UserAlreadyExists({ phoneNumber });
    }

    const hashedPassword = await this.hashService.hash(password);

    const user = await this.userRepository.createOne({ phoneNumber, password: hashedPassword });

    this.loggerService.info('User registered.', { phoneNumber });

    return user;
  }

  public async loginUserByEmail(userData: LoginUserByEmailData): Promise<AccessToken> {
    const { email, password } = userData;

    this.loggerService.debug('Logging user...', { email });

    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UserNotFound({ email });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFound({ email });
    }

    const accessToken = await this.tokenService.createToken({ id: user.id, role: user.role });

    this.loggerService.info('User logged in.', { email });

    return accessToken;
  }

  public async loginUserByPhoneNumber(userData: LoginUserByPhoneNumberData): Promise<AccessToken> {
    const { phoneNumber, password } = userData;

    this.loggerService.debug('Logging user...', { phoneNumber });

    const user = await this.userRepository.findOne({ phoneNumber });

    if (!user) {
      throw new UserNotFound({ phoneNumber });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFound({ phoneNumber });
    }

    const accessToken = await this.tokenService.createToken({ id: user.id, role: user.role });

    this.loggerService.info('User logged in.', { phoneNumber });

    return accessToken;
  }

  public async setPassword(userId: string, newPassword: string): Promise<UserDto> {
    this.loggerService.debug('Setting password...', { userId });

    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFound({ id: userId });
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    const updatedUser = await this.userRepository.updateOne(userId, { password: hashedPassword });

    this.loggerService.info('Password set.', { userId });

    return updatedUser;
  }

  public async findUser(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new UserNotFound({ id: userId });
    }

    return user;
  }

  public async removeUser(userId: string): Promise<void> {
    this.loggerService.debug('Removing user...', { userId });

    await this.userRepository.removeOne(userId);

    this.loggerService.info('User removed.', { userId });
  }
}
