import { FindUserQueryHandler } from './findUserQueryHandler';
import { FindUserQueryHandlerPayload, findUserQueryHandlerPayloadSchema } from './payloads/findUserQueryHandlerPayload';
import { FindUserQueryHandlerResult, findUserQueryHandlerResultSchema } from './payloads/findUserQueryHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { Validator } from '../../../../../../libs/validator/validator';
import { UserNotFoundError } from '../../errors/userNotFoundError';
import { symbols } from '../../../symbols';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

@Injectable()
export class FindUserQueryHandlerImpl implements FindUserQueryHandler {
  public constructor(
    @Inject(symbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
  ) {}

  public async execute(input: FindUserQueryHandlerPayload): Promise<FindUserQueryHandlerResult> {
    const { unitOfWork, userId } = Validator.validate(findUserQueryHandlerPayloadSchema, input);

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findUser({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    return Validator.validate(findUserQueryHandlerResultSchema, { user });
  }
}
