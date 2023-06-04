import { LoginUserCommandHandler } from './loginUserCommandHandler';
import {
  LoginUserCommandHandlerPayload,
  loginUserCommandHandlerPayloadSchema,
} from './payloads/loginUserCommandHandlerPayload';
import {
  LoginUserCommandHandlerResult,
  loginUserCommandHandlerResultSchema,
} from './payloads/loginUserCommandHandlerResult';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { loggerModuleSymbols } from '../../../../../../libs/logger/loggerModuleSymbols';
import { LoggerService } from '../../../../../../libs/logger/services/loggerService/loggerService';
import { Validator } from '../../../../../../libs/validator/validator';
import { UserNotFoundError } from '../../errors/userNotFoundError';
import { symbols } from '../../../symbols';
import { UserRepositoryFactory } from '../../repositories/userRepository/userRepositoryFactory';
import { HashService } from '../../services/hashService/hashService';
import { TokenService } from '../../services/tokenService/tokenService';

@Injectable()
export class LoginUserCommandHandlerImpl implements LoginUserCommandHandler {
  public constructor(
    @Inject(symbols.userRepositoryFactory)
    private readonly userRepositoryFactory: UserRepositoryFactory,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
    @Inject(symbols.hashService)
    private readonly hashService: HashService,
    @Inject(symbols.tokenService)
    private readonly tokenService: TokenService,
  ) {}

  public async execute(input: LoginUserCommandHandlerPayload): Promise<LoginUserCommandHandlerResult> {
    const { unitOfWork, draft } = Validator.validate(loginUserCommandHandlerPayloadSchema, input);

    const findUserBy = 'email' in draft ? { email: draft.email } : { phoneNumber: draft.phoneNumber };

    this.loggerService.debug({ message: 'Logging user in...', context: { findUserBy } });

    const entityManager = unitOfWork.getEntityManager();

    const userRepository = this.userRepositoryFactory.create(entityManager);

    const user = await userRepository.findUser(findUserBy);

    if (!user) {
      throw new UserNotFoundError(findUserBy);
    }

    const passwordIsValid = await this.hashService.compare(draft.password, user.password);

    if (!passwordIsValid) {
      throw new UserNotFoundError(findUserBy);
    }

    const accessToken = this.tokenService.createToken({ id: user.id });

    this.loggerService.info({ message: 'User logged in.', context: { findUserBy, userId: user.id, accessToken } });

    return Validator.validate(loginUserCommandHandlerResultSchema, { accessToken });
  }
}
