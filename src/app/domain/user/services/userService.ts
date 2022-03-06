import { UserDto } from '../dtos';
import { UserAlreadyExists, UserNotFound } from '../errors';
import { UserRepository } from '../repositories/userRepository';
import { HashService } from './hashService';
import { TokenService } from './tokenService';
import { RegisterUserData, LoginUserData } from './types';

export type AccessToken = string;

export class UserService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  public async registerUser(userData: RegisterUserData): Promise<UserDto> {
    const { email, password } = userData;

    console.log(`Registering user ${email}...`);

    const existingUser = await this.userRepository.findOne({ email });

    if (existingUser) {
      throw new UserAlreadyExists({ email });
    }

    const hashedPassword = await this.hashService.hash(password);

    const user = await this.userRepository.createOne({ email, password: hashedPassword });

    console.log(`User ${email} registered.`);

    return user;
  }

  public async loginUser(userData: LoginUserData): Promise<AccessToken> {
    const { email, password } = userData;

    console.log(`Logging user ${email}...`);

    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UserNotFound({ email });
    }

    const passwordIsValid = await this.hashService.compare(password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFound({ email });
    }

    const accessToken = await this.tokenService.createToken({ id: user.id, role: user.role });

    console.log(`User ${email} logged in.`);

    return accessToken;
  }

  public async setPassword(userId: string, newPassword: string): Promise<UserDto> {
    console.log(`Setting password for user with id ${userId}...`);

    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new UserNotFound({ id: userId });
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    const updatedUser = await this.userRepository.updateOne(userId, { password: hashedPassword });

    console.log(`Password for user with id ${userId} set.`);

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
    console.log(`Removing user with id ${userId}...`);

    await this.userRepository.removeOne(userId);

    console.log(`User with id ${userId} removed.`);
  }
}
