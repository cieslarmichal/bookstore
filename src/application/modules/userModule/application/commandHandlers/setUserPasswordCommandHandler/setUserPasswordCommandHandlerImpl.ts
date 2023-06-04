import {
  SetUserPasswordCommandHandlerPayload,
  setUserPasswordCommandHandlerPayloadSchema,
} from './payloads/setUserPasswordCommandHandlerPayload';
import {
  SetUserPasswordCommandHandlerResult,
  setUserPasswordCommandHandlerResultSchema,
} from './payloads/setUserPasswordCommandHandlerResult';
import { SetUserPasswordCommandHandler } from './setUserPasswordCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { UserNotFoundError } from '../../errors/userNotFoundError';
import { symbols } from '../../../symbols';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';
import { HashService } from '../../services/hashService/hashService';

@Injectable()
export class SetUserPasswordCommandHandlerImpl implements SetUserPasswordCommandHandler {
  public constructor(
    @Inject(symbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
    @Inject(symbols.hashService)
    private readonly hashService: HashService,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: SetUserPasswordCommandHandlerPayload): Promise<SetUserPasswordCommandHandlerResult> {
    const {
      unitOfWork,
      userId,
      password: newPassword,
    } = Validator.validate(setUserPasswordCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Setting password...', context: { userId } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findUser({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    const updatedUser = await userRepository.updateUser({ id: userId, draft: { password: hashedPassword } });

    this.loggerService.info({ message: 'Password set.', context: { userId } });

    return Validator.validate(setUserPasswordCommandHandlerResultSchema, { user: updatedUser });
  }
}
