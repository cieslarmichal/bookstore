import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindReviewsQueryHandler } from './findReviewsQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { symbols } from '../../../symbols';
import { ReviewEntityTestFactory } from '../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

describe('FindReviewsQueryHandler', () => {
  let findReviewsQueryHandler: FindReviewsQueryHandler;
  let reviewRepositoryFactory: ReviewRepositoryFactory;
  let customerRepositoryFactory: CustomerRepositoryFactory;
  let userRepositoryFactory: UserRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const reviewEntityTestFactory = new ReviewEntityTestFactory();
  const customerEntityTestFactory = new CustomerEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    findReviewsQueryHandler = container.get<FindReviewsQueryHandler>(symbols.findReviewsQueryHandler);
    reviewRepositoryFactory = container.get<ReviewRepositoryFactory>(symbols.reviewRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

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

      const user1 = await userRepository.createUser({ id: userId1, email: email1 as string, password });

      const user2 = await userRepository.createUser({ id: userId2, email: email2 as string, password });

      const customer1 = await customerRepository.createCustomer({ id: customerId1, userId: user1.id });

      const customer2 = await customerRepository.createCustomer({ id: customerId2, userId: user2.id });

      const review = await reviewRepository.createReview({
        id: reviewId1,
        isbn,
        rate,
        comment: comment as string,
        customerId: customer1.id,
      });

      await reviewRepository.createReview({
        id: reviewId2,
        isbn,
        rate,
        comment: comment as string,
        customerId: customer2.id,
      });

      const { reviews: foundReviews } = await findReviewsQueryHandler.execute({
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
