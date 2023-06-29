import {
  RegisterUserCommandHandlerPayload,
  registerUserCommandHandlerPayloadSchema,
} from './payloads/registerUserCommandHandlerPayload';
import {
  RegisterUserCommandHandlerResult,
  registerUserCommandHandlerResultSchema,
} from './payloads/registerUserCommandHandlerResult';
import { RegisterUserCommandHandler } from './registerUserCommandHandler';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { UuidGenerator } from '../../../../../../libs/uuid/uuidGenerator';
import { Validator } from '../../../../../../libs/validator/validator';
import { symbols } from '../../../symbols';
import { UserAlreadyExistsError } from '../../errors/userAlreadyExistsError';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';
import { HashService } from '../../services/hashService/hashService';

@Injectable()
export class RegisterUserCommandHandlerImpl implements RegisterUserCommandHandler {
  public constructor(
    @Inject(symbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
    @Inject(symbols.hashService)
    private readonly hashService: HashService,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(input: RegisterUserCommandHandlerPayload): Promise<RegisterUserCommandHandlerResult> {
    const { unitOfWork, draft } = Validator.validate(registerUserCommandHandlerPayloadSchema, input);

    const findUserBy = 'email' in draft ? { email: draft.email } : { phoneNumber: draft.phoneNumber };

    this.loggerService.debug({ message: 'Registering user...', context: { findUserBy } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const existingUser = await userRepository.findUser(findUserBy);

    if (existingUser) {
      throw new UserAlreadyExistsError(findUserBy);
    }

    const hashedPassword = await this.hashService.hash(draft.password);

    const user = await userRepository.createUser({
      id: UuidGenerator.generateUuid(),
      email: 'email' in draft ? draft.email : undefined,
      phoneNumber: 'phoneNumber' in draft ? draft.phoneNumber : undefined,
      password: hashedPassword,
    });

    this.loggerService.info({ message: 'User registered.', context: { ...findUserBy, userId: user.id } });

    return Validator.validate(registerUserCommandHandlerResultSchema, { user });
  }
}
