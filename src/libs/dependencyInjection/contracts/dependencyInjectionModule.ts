import { DependencyInjectionContainer } from '../implementations/dependencyInjectionContainer';

export interface DependencyInjectionModule {
  declareBindings(container: DependencyInjectionContainer): Promise<void>;
}
