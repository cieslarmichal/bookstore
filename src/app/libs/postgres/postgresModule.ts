import { DataSource, EntityManager } from 'typeorm';

import { DataSourceFactoryImpl } from './implementations/factories/dataSourceFactoryImpl';
import { PostgresModuleConfig } from './postgresModuleConfig';
import { postgresSymbols } from './postgresSymbols';
import { DependencyInjectionModule } from '../dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../dependencyInjection/implementations/dependencyInjectionContainer';

export class PostgresModule implements DependencyInjectionModule {
  public constructor(private readonly config: PostgresModuleConfig) {}

  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToValue<PostgresModuleConfig>(postgresSymbols.postgresModuleConfig, this.config);

    container.bindToFactory<DataSource>(postgresSymbols.dataSource, DataSourceFactoryImpl);

    container.bindToDynamicValue<EntityManager>(postgresSymbols.entityManager, ({ container }) => {
      const dataSource: DataSource = container.get(postgresSymbols.dataSource);

      return dataSource.manager;
    });
  }
}
