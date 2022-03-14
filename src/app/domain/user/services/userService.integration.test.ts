import { UserRepository } from '../repositories/userRepository';
import { UserService } from './userService';
import { UserTestDataGenerator } from '../testDataGenerators/userTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { UserModule } from '../userModule';
import { UserAlreadyExists, UserNotFound } from '../errors';
import { TokenService } from './tokenService';
import { HashService } from './hashService';
import { UserDto } from '../dtos';
import { UserRole } from '../types';
import { LoggerModule } from '../../../shared/logger/loggerModule';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let tokenService: TokenService;
  let hashService: HashService;
  let userTestDataGenerator: UserTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, UserModule, LoggerModule]);

    userService = container.resolve('userService');
    userRepository = container.resolve('userRepository');
    tokenService = container.resolve('tokenService');
    hashService = container.resolve('hashService');

    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterEach(async () => {});

  describe('Register user', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const createdUserDto = await userService.registerUser({
        email,
        password,
      });

      const userDto = await userRepository.findOneById(createdUserDto.id);

      expect(userDto).not.toBeNull();
    });

    it('should not create user and throw if user with the same email already exists', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      await userRepository.createOne({
        email,
        password,
      });

      try {
        await userService.registerUser({
          email,
          password,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UserAlreadyExists);
      }
    });
  });

  describe('Login user', () => {
    it('should return access token', async () => {
      expect.assertions(2);

      const { email, password } = userTestDataGenerator.generateData();

      const hashedPassword = await hashService.hash(password);

      const user = await userRepository.createOne({
        email,
        password: hashedPassword,
      });

      const accessToken = await userService.loginUser({
        email,
        password,
      });

      const data = await tokenService.verifyToken(accessToken);

      expect(data.id).toBe(user.id);
      expect(data.role).toBe(UserRole.user);
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      try {
        await userService.loginUser({
          email,
          password,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFound);
      }
    });

    it('should throw if user password does not match db password', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const { password: otherPassword } = userTestDataGenerator.generateData();

      await userRepository.createOne({
        email,
        password,
      });

      try {
        await userService.loginUser({
          email,
          password: otherPassword,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFound);
      }
    });
  });

  describe('Set password', () => {
    it(`should update user's password in db`, async () => {
      expect.assertions(2);

      const { email, password } = userTestDataGenerator.generateData();

      const hashedPassword = await hashService.hash(password);

      const user = await userRepository.createOne({
        email,
        password: hashedPassword,
      });

      const { password: newPassword } = userTestDataGenerator.generateData();

      await userService.setPassword(user.id, newPassword);

      const updatedUser = (await userRepository.findOneById(user.id)) as UserDto;

      expect(updatedUser).not.toBeNull();
      expect(await hashService.compare(newPassword, updatedUser.password)).toBe(true);
    });

    it('should throw if user with given email does not exist', async () => {
      expect.assertions(1);

      const { id, password } = userTestDataGenerator.generateData();

      try {
        await userService.setPassword(id, password);
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFound);
      }
    });
  });

  describe('Find user', () => {
    it('finds user by id in database', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({
        email,
        password,
      });

      const foundUser = await userService.findUser(user.id);

      expect(foundUser).not.toBeNull();
    });

    it('should throw if user with given id does not exist in db', async () => {
      expect.assertions(1);

      const { id } = userTestDataGenerator.generateData();

      try {
        await userService.findUser(id);
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFound);
      }
    });
  });

  describe('Remove user', () => {
    it('removes user from database', async () => {
      expect.assertions(1);

      const { email, password } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({
        email,
        password,
      });

      await userService.removeUser(user.id);

      const userDto = await userRepository.findOneById(user.id);

      expect(userDto).toBeNull();
    });

    it('should throw if user with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = userTestDataGenerator.generateData();

      try {
        await userService.removeUser(id);
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFound);
      }
    });
  });
});
