import { DeleteUserResponseNoContentBody, deleteUserResponseNoContentBodySchema } from './schemas/deleteUserSchema';
import { FindUserResponseOkBody, findUserResponseOkBodySchema } from './schemas/findUserSchema';
import {
  LoginUserBody,
  LoginUserResponseOkBody,
  loginUserBodySchema,
  loginUserResponseOkBodySchema,
} from './schemas/loginUserSchema';
import {
  registerUserResponseCreatedBodySchema,
  RegisterUserBody,
  RegisterUserResponseCreatedBody,
  registerUserBodySchema,
} from './schemas/registerUserSchema';
import {
  SetUserEmailBody,
  SetUserEmailResponseOkBody,
  setUserEmailBodySchema,
  setUserEmailResponseOkBodySchema,
} from './schemas/setUserEmailSchema';
import {
  SetUserPasswordBody,
  SetUserPasswordResponseOkBody,
  setUserPasswordBodySchema,
  setUserPasswordResponseOkBodySchema,
} from './schemas/setUserPasswordSchema';
import {
  SetUserPhoneNumberBody,
  SetUserPhoneNumberResponseOkBody,
  setUserPhoneNumberBodySchema,
  setUserPhoneNumberResponseOkBodySchema,
} from './schemas/setUserPhoneNumberSchema';
import { AuthorizationType } from '../../../../../../common/http/authorizationType';
import { HttpController } from '../../../../../../common/http/httpController';
import { HttpMethodName } from '../../../../../../common/http/httpMethodName';
import { HttpRequest } from '../../../../../../common/http/httpRequest';
import {
  HttpCreatedResponse,
  HttpNoContentResponse,
  HttpNotFoundResponse,
  HttpOkResponse,
  HttpUnprocessableEntityResponse,
} from '../../../../../../common/http/httpResponse';
import { HttpRoute } from '../../../../../../common/http/httpRoute';
import { HttpStatusCode } from '../../../../../../common/http/httpStatusCode';
import { ResponseErrorBody, responseErrorBodySchema } from '../../../../../../common/http/responseErrorBodySchema';
import { Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { UnitOfWorkFactory } from '../../../../../../libs/unitOfWork/factories/unitOfWorkFactory/unitOfWorkFactory';
import { unitOfWorkModuleSymbols } from '../../../../../../libs/unitOfWork/unitOfWorkModuleSymbols';
import { DeleteUserCommandHandler } from '../../../application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler';
import { LoginUserCommandHandler } from '../../../application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler';
import { RegisterUserCommandHandler } from '../../../application/commandHandlers/registerUserCommandHandler/registerUserCommandHandler';
import { SetUserEmailCommandHandler } from '../../../application/commandHandlers/setUserEmailCommandHandler/setUserEmailCommandHandler';
import { SetUserPasswordCommandHandler } from '../../../application/commandHandlers/setUserPasswordCommandHandler/setUserPasswordCommandHandler';
import { SetUserPhoneNumberCommandHandler } from '../../../application/commandHandlers/setUserPhoneNumberCommandHandler/setUserPhoneNumberCommandHandler';
import { UserAlreadyExistsError } from '../../../application/errors/userAlreadyExistsError';
import { UserNotFoundError } from '../../../application/errors/userNotFoundError';
import { FindUserQueryHandler } from '../../../application/queryHandlers/findUserQueryHandler/findUserQueryHandler';
import { User } from '../../../domain/entities/user/user';
import { EmailAlreadySetError } from '../../../domain/errors/emailAlreadySetError';
import { PhoneNumberAlreadySetError } from '../../../domain/errors/phoneNumberAlreadySetError';
import { symbols } from '../../../symbols';

export class UserHttpController implements HttpController {
  public readonly basePath = 'users';

  public constructor(
    @Inject(unitOfWorkModuleSymbols.unitOfWorkFactory)
    private readonly unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(symbols.registerUserCommandHandler)
    private readonly registerUserCommandHandler: RegisterUserCommandHandler,
    @Inject(symbols.loginUserCommandHandler)
    private readonly loginUserCommandHandler: LoginUserCommandHandler,
    @Inject(symbols.deleteUserCommandHandler)
    private readonly deleteUserCommandHandler: DeleteUserCommandHandler,
    @Inject(symbols.setUserEmailCommandHandler)
    private readonly setUserEmailCommandHandler: SetUserEmailCommandHandler,
    @Inject(symbols.setUserPasswordCommandHandler)
    private readonly setUserPasswordCommandHandler: SetUserPasswordCommandHandler,
    @Inject(symbols.setUserPhoneNumberCommandHandler)
    private readonly setUserPhoneNumberCommandHandler: SetUserPhoneNumberCommandHandler,
    @Inject(symbols.findUserQueryHandler)
    private readonly findUserQueryHandler: FindUserQueryHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'register',
        handler: this.registerUser.bind(this),
        schema: {
          request: {
            body: registerUserBodySchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: registerUserResponseCreatedBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'login',
        handler: this.loginUser.bind(this),
        schema: {
          request: {
            body: loginUserBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: loginUserResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'set-password',
        handler: this.setUserPassword.bind(this),
        schema: {
          request: {
            body: setUserPasswordBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: setUserPasswordResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'set-email',
        handler: this.setUserEmail.bind(this),
        schema: {
          request: {
            body: setUserEmailBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: setUserEmailResponseOkBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'set-phone-number',
        handler: this.setUserPhoneNumber.bind(this),
        schema: {
          request: {
            body: setUserPhoneNumberBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: setUserPhoneNumberResponseOkBodySchema,
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findUser.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserResponseOkBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteUser.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserResponseNoContentBodySchema,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
            },
          },
        },
        authorizationType: AuthorizationType.bearerToken,
      }),
    ];
  }

  private async registerUser(
    request: HttpRequest<RegisterUserBody>,
  ): Promise<
    HttpCreatedResponse<RegisterUserResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { user } = await unitOfWork.runInTransaction(async () => {
        if ('email' in request.body) {
          const { email, password } = request.body;

          return this.registerUserCommandHandler.execute({ unitOfWork, draft: { email, password } });
        } else {
          const { phoneNumber, password } = request.body;

          return this.registerUserCommandHandler.execute({
            unitOfWork,
            draft: { phoneNumber, password },
          });
        }
      });

      return { statusCode: HttpStatusCode.created, body: { user } };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }
  }

  private async loginUser(
    request: HttpRequest<LoginUserBody>,
  ): Promise<HttpOkResponse<LoginUserResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { accessToken } = await unitOfWork.runInTransaction(async () => {
        if ('email' in request.body) {
          const { email, password } = request.body;

          return this.loginUserCommandHandler.execute({ unitOfWork, draft: { email, password } });
        } else {
          const { phoneNumber, password } = request.body;

          return this.loginUserCommandHandler.execute({ unitOfWork, draft: { phoneNumber, password } });
        }
      });

      return { statusCode: HttpStatusCode.ok, body: { token: accessToken } };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async setUserPassword(
    request: HttpRequest<SetUserPasswordBody, undefined, undefined>,
  ): Promise<HttpOkResponse<SetUserPasswordResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { userId } = request.context;

    const { password } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { user } = await unitOfWork.runInTransaction(async () => {
        return this.setUserPasswordCommandHandler.execute({ unitOfWork, userId: userId as string, password });
      });

      return { statusCode: HttpStatusCode.ok, body: { user } };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async setUserEmail(
    request: HttpRequest<SetUserEmailBody, undefined, undefined>,
  ): Promise<
    | HttpOkResponse<SetUserEmailResponseOkBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { userId } = request.context;

    const { email } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { user } = await unitOfWork.runInTransaction(async () => {
        return this.setUserEmailCommandHandler.execute({ unitOfWork, userId: userId as string, email });
      });

      return { statusCode: HttpStatusCode.ok, body: { user } };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      if (error instanceof EmailAlreadySetError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }
  }

  private async setUserPhoneNumber(
    request: HttpRequest<SetUserPhoneNumberBody, undefined, undefined>,
  ): Promise<
    | HttpOkResponse<SetUserPhoneNumberResponseOkBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    const { userId } = request.context;

    const { phoneNumber } = request.body;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { user } = await unitOfWork.runInTransaction(async () => {
        return this.setUserPhoneNumberCommandHandler.execute({ unitOfWork, userId: userId as string, phoneNumber });
      });

      return { statusCode: HttpStatusCode.ok, body: { user: user as User } };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      if (error instanceof PhoneNumberAlreadySetError) {
        return { statusCode: HttpStatusCode.unprocessableEntity, body: { error } };
      }

      throw error;
    }
  }

  private async findUser(
    request: HttpRequest<undefined, undefined, undefined>,
  ): Promise<HttpOkResponse<FindUserResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      const { user } = await unitOfWork.runInTransaction(async () => {
        return this.findUserQueryHandler.execute({ unitOfWork, userId: userId as string });
      });

      return { statusCode: HttpStatusCode.ok, body: { user: user as User } };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }
  }

  private async deleteUser(
    request: HttpRequest<undefined, undefined, undefined>,
  ): Promise<HttpNoContentResponse<DeleteUserResponseNoContentBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    const { userId } = request.context;

    const unitOfWork = await this.unitOfWorkFactory.create();

    try {
      await unitOfWork.runInTransaction(async () => {
        await this.deleteUserCommandHandler.execute({ unitOfWork, userId: userId as string });
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return { statusCode: HttpStatusCode.notFound, body: { error } };
      }

      throw error;
    }

    return { statusCode: HttpStatusCode.noContent, body: null };
  }
}
