import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { FindReviewQueryHandler } from './findReviewQueryHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userSymbols } from '../../../../userModule/symbols';
import { ReviewNotFoundError } from '../../errors/reviewNotFoundError';
import { symbols } from '../../../symbols';
import { ReviewEntityTestFactory } from '../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

describe('FindReviewQueryHandler', () => {
  let findReviewQueryHandler: FindReviewQueryHandler;
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

    findReviewQueryHandler = container.get<FindReviewQueryHandler>(symbols.findReviewQueryHandler);
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

      const user = await userRepository.createUser({ id: userId, email: email as string, password });

      const customer = await customerRepository.createCustomer({ id: customerId, userId: user.id });

      const review = await reviewRepository.createReview({
        id,
        isbn,
        rate,
        comment: comment as string,
        customerId: customer.id,
      });

      const { review: foundReview } = await findReviewQueryHandler.execute({ unitOfWork, reviewId: review.id });

      expect(foundReview).not.toBeNull();
    });
  });

  it('should throw if review with given id does not exist in db', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { id } = reviewEntityTestFactory.create();

      try {
        await findReviewQueryHandler.execute({ unitOfWork, reviewId: id });
      } catch (error) {
        expect(error).toBeInstanceOf(ReviewNotFoundError);
      }
    });
  });
});
