import { authorSymbols } from './authorSymbols';
import { AuthorRepositoryFactory } from './contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorMapper } from './contracts/mappers/authorMapper/authorMapper';
import { AuthorService } from './contracts/services/authorService/authorService';
import { AuthorRepositoryFactoryImpl } from './implementations/factories/authorRepositoryFactory/authorRepositoryFactoryImpl';
import { AuthorMapperImpl } from './implementations/mappers/authorMapper/authorMapperImpl';
import { AuthorServiceImpl } from './implementations/services/authorService/authorServiceImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class AuthorModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<AuthorMapper>(authorSymbols.authorMapper, AuthorMapperImpl);

    container.bindToConstructor<AuthorRepositoryFactory>(
      authorSymbols.authorRepositoryFactory,
      AuthorRepositoryFactoryImpl,
    );

    container.bindToConstructor<AuthorService>(authorSymbols.authorService, AuthorServiceImpl);
  }
}
