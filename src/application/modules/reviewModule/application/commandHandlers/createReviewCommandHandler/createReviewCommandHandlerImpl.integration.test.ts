import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateReviewCommandHandler } from './createReviewCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { symbols } from '../../../symbols';
import { ReviewEntityTestFactory } from '../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

describe('CreateReviewCommandHandler', () => {
  let createReviewCommandHandler: CreateReviewCommandHandler;
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

    createReviewCommandHandler = container.get<CreateReviewCommandHandler>(symbols.createReviewCommandHandler);
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

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const { review } = await createReviewCommandHandler.execute({
        unitOfWork,
        draft: {
          isbn,
          rate,
          comment: comment as string,
          customerId: customer.id,
        },
      });

      const foundReview = await reviewRepository.findReview({ id: review.id });

      expect(foundReview).not.toBeNull();
    });
  });
});
