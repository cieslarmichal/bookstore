import { LogLevel } from './app/libs/logger/logLevel';

export interface AppConfig {
  readonly databaseHost: string;
  readonly databasePort: number;
  readonly databaseName: string;
  readonly databaseUser: string;
  readonly databasePassword: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly hashSaltRounds: number;
  readonly logLevel: LogLevel;
  readonly httpPort: number;
}
