import { DependencyInjectionContainer } from './dependencyInjectionContainer';

export interface DependencyInjectionModule {
  declareBindings(container: DependencyInjectionContainer): void;
}
