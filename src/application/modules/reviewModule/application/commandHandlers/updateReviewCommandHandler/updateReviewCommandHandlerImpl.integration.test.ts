import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { UpdateReviewCommandHandler } from './updateReviewCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { CustomerRepositoryFactory } from '../../../../customerModule/application/repositories/customerRepository/customerRepositoryFactory';
import { customerSymbols } from '../../../../customerModule/symbols';
import { CustomerEntityTestFactory } from '../../../../customerModule/tests/factories/customerEntityTestFactory/customerEntityTestFactory';
import { UserRepositoryFactory } from '../../../../userModule/application/repositories/userRepository/userRepositoryFactory';
import { UserEntityTestFactory } from '../../../../userModule/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { userModuleSymbols } from '../../../../userModule/userModuleSymbols';
import { ReviewNotFoundError } from '../../../infrastructure/errors/reviewNotFoundError';
import { symbols } from '../../../symbols';
import { ReviewEntityTestFactory } from '../../../tests/factories/reviewEntityTestFactory/reviewEntityTestFactory';
import { ReviewRepositoryFactory } from '../../repositories/reviewRepository/reviewRepositoryFactory';

describe('UpdateReviewCommandHandler', () => {
  let updateReviewCommandHandler: UpdateReviewCommandHandler;
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

    updateReviewCommandHandler = container.get<UpdateReviewCommandHandler>(symbols.updateReviewCommandHandler);
    reviewRepositoryFactory = container.get<ReviewRepositoryFactory>(symbols.reviewRepositoryFactory);
    userRepositoryFactory = container.get<UserRepositoryFactory>(userModuleSymbols.userRepositoryFactory);
    customerRepositoryFactory = container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

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

      const review = await reviewRepository.createReview({
        id,
        isbn,
        rate,
        comment: comment as string,
        customerId: customer.id,
      });

      const { review: updatedReview } = await updateReviewCommandHandler.execute({
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
        await updateReviewCommandHandler.execute({ unitOfWork, reviewId: id, draft: { rate } });
      } catch (error) {
        expect(error).toBeInstanceOf(ReviewNotFoundError);
      }
    });
  });
});
