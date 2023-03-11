import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookCategoryEntity } from '../../../../bookCategory/contracts/bookCategoryEntity';
import { CartEntity } from '../../../../cart/contracts/cartEntity';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { CustomerRepositoryFactory } from '../../../../customer/contracts/factories/customerRepositoryFactory/customerRepositoryFactory';
import { CustomerModule } from '../../../../customer/customerModule';
import { customerSymbols } from '../../../../customer/customerSymbols';
import { CustomerEntityTestFactory } from '../../../../customer/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { InventoryEntity } from '../../../../inventory/contracts/inventoryEntity';
import { LineItemEntity } from '../../../../lineItem/contracts/lineItemEntity';
import { OrderEntity } from '../../../../order/contracts/orderEntity';
import { UserRepositoryFactory } from '../../../../user/contracts/factories/userRepositoryFactory/userRepositoryFactory';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../../user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../user/userModule';
import { userSymbols } from '../../../../user/userSymbols';
import { ReviewRepositoryFactory } from '../../../contracts/factories/reviewRepositoryFactory/reviewRepositoryFactory';
import { ReviewEntity } from '../../../contracts/reviewEntity';
import { ReviewService } from '../../../contracts/services/reviewService/reviewService';
import { ReviewNotFoundError } from '../../../errors/reviewNotFoundError';
import { ReviewModule } from '../../../reviewModule';
import { reviewSymbols } from '../../../reviewSymbols';
import { ReviewEntityTestFactory } from '../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';

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
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new ReviewModule(),
        new UserModule(userModuleConfig),
        new CustomerModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    reviewService = container.get<ReviewService>(reviewSymbols.reviewService);
    reviewRepositoryFactory = container.get<ReviewRepositoryFactory>(reviewSymbols.reviewRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

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

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

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

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

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

        const { id: userId1, email: email1, password, role } = userEntityTestFactory.create();

        const { id: userId2, email: email2 } = userEntityTestFactory.create();

        const { id: customerId1 } = customerEntityTestFactory.create();

        const { id: customerId2 } = customerEntityTestFactory.create();

        const user1 = await userRepository.createOne({ id: userId1, email: email1 as string, password, role });

        const user2 = await userRepository.createOne({ id: userId2, email: email2 as string, password, role });

        const customer1 = await customerRepository.createOne({ id: customerId1, userId: user1.id });

        const customer2 = await customerRepository.createOne({ id: customerId2, userId: user2.id });

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

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

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

        const { id: userId, email, password, role } = userEntityTestFactory.create();

        const { id: customerId } = customerEntityTestFactory.create();

        const user = await userRepository.createOne({ id: userId, email: email as string, password, role });

        const customer = await customerRepository.createOne({ id: customerId, userId: user.id });

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
