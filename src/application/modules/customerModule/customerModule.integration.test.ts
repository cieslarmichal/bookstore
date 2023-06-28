import 'reflect-metadata';

import { CustomerHttpController } from './api/httpControllers/customerHttpController/customerHttpController';
import { CustomerRepositoryFactory } from './application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerRepositoryFactoryImpl } from './infrastructure/repositories/customerRepository/customerRepositoryFactoryImpl';
import { customerSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('CustomerModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
  });

  it('declares bindings', async () => {
    expect(container.get<CustomerRepositoryFactory>(customerSymbols.customerRepositoryFactory)).toBeInstanceOf(
      CustomerRepositoryFactoryImpl,
    );

    expect(container.get<CustomerHttpController>(customerSymbols.customerHttpController)).toBeInstanceOf(
      CustomerHttpController,
    );
  });
});
