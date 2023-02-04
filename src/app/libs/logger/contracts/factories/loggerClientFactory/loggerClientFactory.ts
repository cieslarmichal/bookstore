import { LoggerClient } from '../../clients/loggerClient/loggerClient';

export interface LoggerClientFactory {
  create(): LoggerClient;
}
