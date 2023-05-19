import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { ReviewService } from './reviewService';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookEntity } from '../../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorEntity } from '../../../../authorModule/infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { BookCategoryEntity } from '../../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerModule } from '../../../../customerModule/customerModule';
import { CustomerEntity } from '../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { CartEntity } from '../../../../orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../../../orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../userModule/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../userModule/userModule';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { ReviewNotFoundError } from '../../../infrastructure/errors/reviewNotFoundError';
import { ReviewEntity } from '../../../infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { ReviewModule } from '../../../reviewModule';
import { reviewModuleSymbols } from '../../../reviewModuleSymbols';
import { ReviewEntityTestFactory } from '../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

describe('ReviewServiceImpl', () => {
  let reviewService: ReviewService;
  let reviewRepositoryFactory: ReviewRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const reviewEntityTestFactory = new ReviewEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

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
    const container = DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new ReviewModule(),
        new UserModule(userModuleConfig),
        new CustomerModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    reviewService = container.get<ReviewService>(reviewModuleSymbols.reviewService);
    reviewRepositoryFactory = container.get<ReviewRepositoryFactory>(reviewModuleSymbols.reviewRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create review', () => {
    it('creates review in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

        const review = await reviewService.createReview({
          unitOfWork,
          draft: {
            isbn,
            rate,
            comment: comment as string,
            customerId: customer.id,
          },
        });

        const foundReview = await reviewRepository.findOne({ id: review.id });

        expect(foundReview).not.toBeNull();
      });
    });
  });

  describe('Find review', () => {
    it('finds review by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const foundReview = await reviewService.findReview({ unitOfWork, reviewId: review.id });

        expect(foundReview).not.toBeNull();
      });
    });

    it('should throw if review with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = reviewEntityTestFactory.create();

        try {
          await reviewService.findReview({ unitOfWork, reviewId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(ReviewNotFoundError);
        }
      });
    });
  });

  describe('Find reviews', () => {
    it('finds reviews by customer id', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id: reviewId1, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: reviewId2 } = reviewEntityTestFactory.create();

        const { id: userId1, email: email1, password } = userEntityTestFactory.create();

        const { id: userId2, email: email2 } = userEntityTestFactory.create();

        const { id: customerId1 } = customerEntityTestFactory.create();

        const { id: customerId2 } = customerEntityTestFactory.create();

        const user1 = await userRepository.createOne({ id: userId1, email: email1 as string, password });

        const user2 = await userRepository.createOne({ id: userId2, email: email2 as string, password });

        const customer1 = await customerRepository.createCustomer({ id: customerId1, userId: user1.id });

        const customer2 = await customerRepository.createCustomer({ id: customerId2, userId: user2.id });

        const review = await reviewRepository.createOne({
          id: reviewId1,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer1.id,
        });

        await reviewRepository.createOne({
          id: reviewId2,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer2.id,
        });

        const foundReviews = await reviewService.findReviews({
          unitOfWork,
          customerId: customer1.id,
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(foundReviews.length).toBe(1);
        expect(foundReviews[0]).toStrictEqual(review);
      });
    });
  });

  describe('Update review', () => {
    it('updates review in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { rate: updatedRate } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        const updatedReview = await reviewService.updateReview({
          unitOfWork,
          reviewId: review.id,
          draft: { rate: updatedRate },
        });

        expect(updatedReview).not.toBeNull();
        expect(updatedReview.rate).toBe(updatedRate);
      });
    });

    it('should not update review and throw if review with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, rate } = reviewEntityTestFactory.create();

        try {
          await reviewService.updateReview({ unitOfWork, reviewId: id, draft: { rate } });
        } catch (error) {
          expect(error).toBeInstanceOf(ReviewNotFoundError);
        }
      });
    });
  });

  describe('Delete review', () => {
    it('deletes review from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const reviewRepository = reviewRepositoryFactory.create(entityManager);

        const userRepository = userRepositoryFactory.create(entityManager);

        const customerRepository = customerRepositoryFactory.create(entityManager);

        const { id, isbn, rate, comment } = reviewEntityTestFactory.create();

        const { id: userId, email, password } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password });

        const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

        const review = await reviewRepository.createOne({
          id,
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        });

        await reviewService.deleteReview({ unitOfWork, reviewId: review.id });

        const foundReview = await reviewRepository.findOne({ id: review.id });

        expect(foundReview).toBeNull();
      });
    });

    it('should throw if review with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = reviewEntityTestFactory.create();

        try {
          await reviewService.deleteReview({ unitOfWork, reviewId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(ReviewNotFoundError);
        }
      });
    });
  });
});
