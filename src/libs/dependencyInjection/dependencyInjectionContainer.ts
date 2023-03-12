import { Container, interfaces } from 'inversify';

import { FactoryLike } from './factoryLike';

export class DependencyInjectionContainer {
  private instance: Container;

  public constructor() {
    this.instance = new Container({ autoBindInjectable: false, defaultScope: 'Singleton' });
  }

  public resolve<T>(constructor: interfaces.Newable<T>): T {
    return this.instance.resolve(constructor);
  }

  public bindToValue<T>(symbol: symbol, value: T): DependencyInjectionContainer {
    this.instance.bind(symbol).toConstantValue(value);

    return this;
  }

  public bindToConstructor<T>(symbol: symbol, constructor: interfaces.Newable<T>): DependencyInjectionContainer {
    this.instance.bind(symbol).to(constructor);

    return this;
  }

  public bindToFactory<T>(
    symbol: symbol,
    factoryConstructor: interfaces.Newable<FactoryLike<T>>,
  ): DependencyInjectionContainer {
    this.instance.bind(symbol).toDynamicValue(({ container }) => {
      const factory = container.resolve(factoryConstructor);

      return factory.create();
    });

    return this;
  }

  public bindToDynamicValue<T>(symbol: symbol, dynamicValue: interfaces.DynamicValue<T>): DependencyInjectionContainer {
    this.instance.bind(symbol).toDynamicValue(dynamicValue);

    return this;
  }

  public getAsync<T>(symbol: symbol): Promise<T> {
    return this.instance.getAsync(symbol);
  }

  public get<T>(symbol: symbol): T {
    return this.instance.get(symbol);
  }
}
