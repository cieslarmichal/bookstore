import {
  SetUserEmailCommandHandlerPayload,
  setUserEmailCommandHandlerPayloadSchema,
} from './payloads/setUserEmailCommandHandlerPayload';
import {
  SetUserEmailCommandHandlerResult,
  setUserEmailCommandHandlerResultSchema,
} from './payloads/setUserEmailCommandHandlerResult';
import { SetUserEmailCommandHandler } from './setUserEmailCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { EmailAlreadySetError } from '../../../domain/errors/emailAlreadySetError';
import { symbols } from '../../../symbols';
import { UserAlreadyExistsError } from '../../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../errors/userNotFoundError';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

@Injectable()
export class SetUserEmailCommandHandlerImpl implements SetUserEmailCommandHandler {
  public constructor(
    @Inject(symbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: SetUserEmailCommandHandlerPayload): Promise<SetUserEmailCommandHandlerResult> {
    const { unitOfWork, userId, email } = Validator.validate(setUserEmailCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Setting email...', context: { userId, email } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findUser({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    if (user.email) {
      throw new EmailAlreadySetError({ userId, email });
    }

    const existingUserWithTargetEmail = await userRepository.findUser({ email });

    if (existingUserWithTargetEmail) {
      throw new UserAlreadyExistsError({ email });
    }

    const updatedUser = await userRepository.updateUser({ id: userId, draft: { email } });

    this.loggerService.info({ message: 'Email set.', context: { userId, email } });

    return Validator.validate(setUserEmailCommandHandlerResultSchema, { user: updatedUser });
  }
}
