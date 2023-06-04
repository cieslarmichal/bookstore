import {
  SetUserPhoneNumberCommandHandlerPayload,
  setUserPhoneNumberCommandHandlerPayloadSchema,
} from './payloads/setUserPhoneNumberCommandHandlerPayload';
import {
  SetUserPhoneNumberCommandHandlerResult,
  setUserPhoneNumberCommandHandlerResultSchema,
} from './payloads/setUserPhoneNumberCommandHandlerResult';
import { SetUserPhoneNumberCommandHandler } from './setUserPhoneNumberCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { PhoneNumberAlreadySetError } from '../../../domain/errors/phoneNumberAlreadySetError';
import { UserAlreadyExistsError } from '../../../infrastructure/errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../../infrastructure/errors/userNotFoundError';
import { symbols } from '../../../symbols';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';

@Injectable()
export class SetUserPhoneNumberCommandHandlerImpl implements SetUserPhoneNumberCommandHandler {
  public constructor(
    @Inject(symbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(
    input: SetUserPhoneNumberCommandHandlerPayload,
  ): Promise<SetUserPhoneNumberCommandHandlerResult> {
    const { unitOfWork, phoneNumber, userId } = Validator.validate(
      setUserPhoneNumberCommandHandlerPayloadSchema,
      input,
    );

    this.loggerService.debug({ message: 'Setting phone number...', context: { userId, phoneNumber } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findUser({ id: userId });

    if (!user) {
      throw new UserNotFoundError({ id: userId });
    }

    if (user.phoneNumber) {
      throw new PhoneNumberAlreadySetError({ userId, phoneNumber });
    }

    const existingUserWithTargetPhoneNumber = await userRepository.findUser({ phoneNumber });

    if (existingUserWithTargetPhoneNumber) {
      throw new UserAlreadyExistsError({ phoneNumber });
    }

    const updatedUser = await userRepository.updateUser({ id: userId, draft: { phoneNumber } });

    this.loggerService.info({ message: 'Phone number set.', context: { userId, phoneNumber } });

    return Validator.validate(setUserPhoneNumberCommandHandlerResultSchema, { user: updatedUser });
  }
}
