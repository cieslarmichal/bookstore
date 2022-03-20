// import { BookRepository } from '../bookRepository';
// import { BookTestDataGenerator } from '../../testDataGenerators/bookTestDataGenerator';
import { ConfigLoader } from '../../../../../configLoader';
import { createDIContainer } from '../../../../shared';
import { DbModule } from '../../../../shared';
import { BookModule } from '../../bookModule';
import { PostgresHelper } from '../../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../../shared/logger/loggerModule';
// import { BOOK_REPOSITORY } from '../../bookInjectionSymbols';
import { BookQueryBuilder } from './bookQueryBuilder';
import { EntityManager } from 'typeorm';
import { ENTITY_MANAGER } from '../../../../shared/db/dbInjectionSymbols';

describe('BookService', () => {
  // let bookRepository: BookRepository;
  let entityManager: EntityManager;
  // let bookTestDataGenerator: BookTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, BookModule, LoggerModule]);

    // bookRepository = container.resolve(BOOK_REPOSITORY);
    entityManager = container.resolve(ENTITY_MANAGER);

    // bookTestDataGenerator = new BookTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create builder', () => {
    it('creates builder and get its sql query', async () => {
      expect.assertions(1);

      // const { title, releaseYear, language, format, price } = bookTestDataGenerator.generateData();

      // const createdBookDto = await bookRepository.createBook({
      //   title,
      //   releaseYear,
      //   language,
      //   format,
      //   price,
      // });

      const bookQueryBuilder = new BookQueryBuilder(entityManager);
      const sqlQuery = bookQueryBuilder
        .conditions({ title: { eq: 'crime' }, releaseYear: { lt: 2006 } })
        .skip(0)
        .take(1)
        .getSql();

      console.log(sqlQuery);
    });
  });
});
