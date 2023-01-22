import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { UnitOfWorkFactory } from './unitOfWorkFactory';
import { unitOfWorkSymbols } from './unitOfWorkSymbols';
import { Module } from '../dependencyInjection/module';

export class UnitOfWorkModule extends Module {
  public override async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [unitOfWorkSymbols.unitOfWorkFactory]: asClass(UnitOfWorkFactory, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
