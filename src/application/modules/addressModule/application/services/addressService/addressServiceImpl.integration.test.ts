import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { AddressService } from './addressService';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { EqualFilter } from '../../../../../../common/types/filter';
import { FilterName } from '../../../../../../common/types/filterName';
import { FilterSymbol } from '../../../../../../common/types/filterSymbol';
import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthorBookEntity } from '../../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorEntity } from '../../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryEntity } from '../../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerModule } from '../../../../customerModule/customerModule';
import { customerModuleSymbols } from '../../../../customerModule/customerModuleSymbols';
import { CustomerEntity } from '../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { CartEntity } from '../../../../orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../../../orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../userModule/userModule';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { AddressModule } from '../../../addressModule';
import { addressModuleSymbols } from '../../../addressModuleSymbols';
import { AddressNotFoundError } from '../../../infrastructure/errors/addressNotFoundError';
import { AddressEntity } from '../../../infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AddressEntityTestFactory } from '../../../tests/factories/addressEntityTestFactory/addressEntityTestFactory';
import { AddressRepositoryFactory } from '../../repositories/addressRepository/addressRepositoryFactory';

describe('AddressServiceImpl', () => {
  let addressService: AddressService;
  let addressRepositoryFactory: AddressRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;

  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const addressEntityTestFactory = new AddressEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();

  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
    ],
  });

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new AddressModule(),
        new LoggerModule(loggerModuleConfig),
        new CustomerModule(),
        new UserModule(userModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    addressService = container.get<AddressService>(addressModuleSymbols.addressService);
    addressRepositoryFactory = container.get<AddressRepositoryFactory>(addressModuleSymbols.addressRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(
      customerModuleSymbols.customerRepositoryFactory,
    );
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create address', () => {
    it('creates address in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
          addressEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const createdAddress = await addressService.createAddress({
          unitOfWork,
          draft: {
            firstName,
            lastName,
            phoneNumber,
            country,
            state,
            city,
            zipCode,
            streetAddress,
            customerId: customer.id,
          },
        });

        const foundAddress = await addressRepository.findOne({ id: createdAddress.id });

        expect(foundAddress).not.toBeNull();
      });
    });
  });

  describe('Find address', () => {
    it('finds address by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const address = await addressRepository.createOne({
          id: addressId,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const foundAddress = await addressService.findAddress({ unitOfWork, addressId: address.id });

        expect(foundAddress).not.toBeNull();
      });
    });

    it('should throw if address with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = addressEntityTestFactory.create();

        try {
          await addressService.findAddress({ unitOfWork, addressId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(AddressNotFoundError);
        }
      });
    });
  });

  describe('Find addresses', () => {
    it('finds addresses by customerId', async () => {
      expect.assertions(3);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId1, email: email1, password } = userEntityTestFactory.create();

        const { id: userId2, email: email2 } = userEntityTestFactory.create();

        const { id: customerId1 } = customerEntityTestFactory.create();

        const { id: customerId2 } = customerEntityTestFactory.create();

        const {
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const { id: addressId2 } = addressEntityTestFactory.create();

        const { id: addressId3 } = addressEntityTestFactory.create();

        const user1 = await userRepository.createOne({ id: userId1, email: email1 as string, password });

        const user2 = await userRepository.createOne({ id: userId2, email: email2 as string, password });

        const customer1 = await customerRepository.createOne({ id: customerId1, userId: user1.id });

        const customer2 = await customerRepository.createOne({ id: customerId2, userId: user2.id });

        const address1 = await addressRepository.createOne({
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer1.id,
        });

        const address2 = await addressRepository.createOne({
          id: addressId2,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer1.id,
        });

        await addressRepository.createOne({
          id: addressId3,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer2.id,
        });

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'customerId',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [customer1.id],
        };

        const foundAddresses = await addressService.findAddresses({
          unitOfWork,
          filters: [equalFilterForFirstNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(foundAddresses.length).toBe(2);
        expect(foundAddresses[0]).toStrictEqual(address1);
        expect(foundAddresses[1]).toStrictEqual(address2);
      });
    });

    it('finds addresses by customerId limited by pagination', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const { id: addressId2 } = addressEntityTestFactory.create();

        const { id: addressId3 } = addressEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        await addressRepository.createOne({
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        await addressRepository.createOne({
          id: addressId2,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        await addressRepository.createOne({
          id: addressId3,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'customerId',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [customer.id],
        };

        const foundAddresses = await addressService.findAddresses({
          unitOfWork,
          filters: [equalFilterForFirstNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(foundAddresses.length).toBe(3);
      });
    });
  });

  describe('Delete address', () => {
    it('deletes address from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const addressRepository = addressRepositoryFactory.create(entityManager);

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const {
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
        } = addressEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

        const address = await addressRepository.createOne({
          id: addressId1,
          firstName,
          lastName,
          phoneNumber,
          country,
          state,
          city,
          zipCode,
          streetAddress,
          customerId: customer.id,
        });

        await addressService.deleteAddress({ unitOfWork, addressId: address.id });

        const foundAddress = await addressRepository.findOne({ id: address.id });

        expect(foundAddress).toBeNull();
      });
    });

    it('should throw if address with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = addressEntityTestFactory.create();

        try {
          await addressService.deleteAddress({ unitOfWork, addressId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(AddressNotFoundError);
        }
      });
    });
  });
});
