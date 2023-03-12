import { HttpService } from '../../services/httpService/httpService';
import { HttpServiceConfig } from '../../services/httpService/httpServiceConfig';

export interface HttpServiceFactory {
  create(config: HttpServiceConfig): HttpService;
}
