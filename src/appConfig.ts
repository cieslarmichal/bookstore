export interface AppConfig {
  readonly databaseHost: string;
  readonly databasePort: string;
  readonly databaseName: string;
  readonly databaseUser: string;
  readonly databasePassword: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly hashSaltRounds: string;
  readonly gmailSmtpHost: string;
  readonly gmailSmtpPort: string;
  readonly yahooSmtpHost: string;
  readonly yahooSmtpPort: string;
  readonly outlookSmtpHost: string;
  readonly outlookSmtpPort: string;
  readonly timeWindow: string;
}
