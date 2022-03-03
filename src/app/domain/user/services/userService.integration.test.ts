import { UserRepository } from '../repositories/userRepository';
import { UserService } from './userService';
import { UserTestDataGenerator } from '../testDataGenerators/userTestDataGenerator';
import { ConfigLoader } from '../../../config';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { UserModule } from '../userModule';
import { UserAlreadyExists, UserNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let userTestDataGenerator: UserTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, UserModule]);

    userService = container.resolve('userService');
    userRepository = container.resolve('userRepository');

    userTestDataGenerator = new UserTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create user', () => {
    it('creates user in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const createdUserDto = await userService.createUser({
        email,
        password,
        role,
      });

      const userDto = await userRepository.findOneById(createdUserDto.id);

      expect(userDto).not.toBeNull();
    });

    it('should not create user and throw if user with the same email already exists', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      await userRepository.createOne({
        email,
        password,
        role,
      });

      try {
        await userService.createUser({
          email,
          password,
          role,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UserAlreadyExists);
      }
    });
  });

  describe('Find user', () => {
    it('finds user by id in database', async () => {
      expect.assertions(1);

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({
        email,
        password,
        role,
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

      const { email, password, role } = userTestDataGenerator.generateData();

      const user = await userRepository.createOne({
        email,
        password,
        role,
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
