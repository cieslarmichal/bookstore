import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteReviewCommandHandler } from './deleteReviewCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { ReviewNotFoundError } from '../../../infrastructure/errors/reviewNotFoundError';
import { symbols } from '../../../symbols';
import { ReviewEntityTestFactory } from '../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

describe('DeleteReviewCommandHandler', () => {
  let deleteReviewCommandHandler: DeleteReviewCommandHandler;
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

    deleteReviewCommandHandler = container.get<DeleteReviewCommandHandler>(symbols.deleteReviewCommandHandler);
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

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const review = await reviewRepository.createReview({
        id,
        isbn,
        rate,
        comment: comment as string,
        customerId: customer.id,
      });

      await deleteReviewCommandHandler.execute({ unitOfWork, reviewId: review.id });

      const foundReview = await reviewRepository.findReview({ id: review.id });

      expect(foundReview).toBeNull();
    });
  });

  it('should throw if review with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = reviewEntityTestFactory.create();

      try {
        await deleteReviewCommandHandler.execute({ unitOfWork, reviewId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(ReviewNotFoundError);
      }
    });
  });
});
