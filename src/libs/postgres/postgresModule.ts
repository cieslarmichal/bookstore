import { DataSource, EntityManager } from 'typeorm';

import { DataSourceFactoryImpl } from './factories/dataSourceFactory/dataSourceFactoryImpl';
import { PostgresModuleConfig } from './postgresModuleConfig';
import { postgresModuleSymbols } from './postgresModuleSymbols';
import { DependencyInjectionContainer } from '../dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../dependencyInjection/dependencyInjectionModule';

export class PostgresModule implements DependencyInjectionModule {
  public constructor(private readonly config: PostgresModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<PostgresModuleConfig>(postgresModuleSymbols.postgresModuleConfig, this.config);

    container.bindToFactory<DataSource>(postgresModuleSymbols.dataSource, DataSourceFactoryImpl);

    container.bindToDynamicValue<EntityManager>(postgresModuleSymbols.entityManager, ({ container }) => {
      const dataSource: DataSource = container.get(postgresModuleSymbols.dataSource);

      return dataSource.manager;
    });
  }
}
