import { LogLevel } from '../libs/logger/logLevel';

export interface ApplicationConfig {
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly hashSaltRounds: number;
  readonly databaseHost: string;
  readonly databasePort: number;
  readonly databaseName: string;
  readonly databaseUser: string;
  readonly databasePassword: string;
  readonly logLevel: LogLevel;
}
