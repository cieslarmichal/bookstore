import { AwilixContainer } from 'awilix';

export interface Module {
  registerSymbols(container: AwilixContainer): Promise<void>;
}
