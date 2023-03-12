import { HttpServiceFactory } from './httpServiceFactory';
import { Injectable, Inject } from '../../../dependencyInjection/decorators';
import { LoggerService } from '../../../logger/contracts/services/loggerService/loggerService';
import { loggerModuleSymbols } from '../../../logger/loggerModuleSymbols';
import { Validator } from '../../../validator/implementations/validator';
import { FetchClient } from '../../clients/fetchClient/fetchClient';
import { httpModuleSymbols } from '../../httpModuleSymbols';
import { HttpService } from '../../services/httpService/httpService';
import { HttpServiceConfig, httpServiceConfigSchema } from '../../services/httpService/httpServiceConfig';
import { HttpServiceImpl } from '../../services/httpService/httpServiceImpl';

@Injectable()
export class HttpServiceFactoryImpl implements HttpServiceFactory {
  public constructor(
    @Inject(httpModuleSymbols.fetchClient)
    private readonly fetchClient: FetchClient,
    @Inject(loggerModuleSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public create(input: HttpServiceConfig): HttpService {
    const config = Validator.validate(httpServiceConfigSchema, input);

    return new HttpServiceImpl(config, this.fetchClient, this.loggerService);
  }
}
