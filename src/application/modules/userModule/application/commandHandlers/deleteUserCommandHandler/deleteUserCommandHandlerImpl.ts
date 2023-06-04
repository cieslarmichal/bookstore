import { DeleteUserCommandHandler } from './deleteUserCommandHandler';
import {
  DeleteUserCommandHandlerPayload,
  deleteUserCommandHandlerPayloadSchema,
} from './payloads/deleteUserCommandHandlerPayload';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

@Injectable()
export class DeleteUserCommandHandlerImpl implements DeleteUserCommandHandler {
  public constructor(
    @Inject(symbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: DeleteUserCommandHandlerPayload): Promise<void> {
    const { unitOfWork, userId } = Validator.validate(deleteUserCommandHandlerPayloadSchema, input);

    this.loggerService.debug({ message: 'Deleting user...', context: { userId } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    await userRepository.deleteUser({ id: userId });

    this.loggerService.info({ message: 'User deleted.', context: { userId } });
  }
}
