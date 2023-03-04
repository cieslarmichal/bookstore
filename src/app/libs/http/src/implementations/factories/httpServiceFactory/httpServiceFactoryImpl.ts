import { Injectable, Inject } from '../../../../../dependencyInjection/contracts/decorators';
import { LoggerService } from '../../../../../logger/contracts/services/loggerService/loggerService';
import { loggerSymbols } from '../../../../../logger/loggerSymbols';
import { Validator } from '../../../../../validator/implementations/validator';
import { FetchClient } from '../../../contracts/clients/fetchClient/fetchClient';
import { HttpServiceFactory } from '../../../contracts/factories/httpServiceFactory/httpServiceFactory';
import { HttpService } from '../../../contracts/services/httpService/httpService';
import { HttpServiceConfig, httpServiceConfigSchema } from '../../../contracts/services/httpService/httpServiceConfig';
import { httpSymbols } from '../../../httpSymbols';
import { HttpServiceImpl } from '../../services/httpService/httpServiceImpl';

@Injectable()
export class HttpServiceFactoryImpl implements HttpServiceFactory {
  public constructor(
    @Inject(httpSymbols.fetchClient)
    private readonly fetchClient: FetchClient,
    @Inject(loggerSymbols.loggerService)
    private readonly loggerService: LoggerService,
  ) {}

  public create(input: HttpServiceConfig): HttpService {
    const config = Validator.validate(httpServiceConfigSchema, input);

    return new HttpServiceImpl(config, this.fetchClient, this.loggerService);
  }
}
