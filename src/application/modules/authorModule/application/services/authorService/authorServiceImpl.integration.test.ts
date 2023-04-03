import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { AuthorService } from './authorService';
import { TestTransactionInternalRunner } from '../../../../../common/tests/testTransactionInternalRunner';
import { EqualFilter } from '../../../../../common/types/filter';
import { FilterName } from '../../../../../common/types/filterName';
import { FilterSymbol } from '../../../../../common/types/filterSymbol';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresModuleSymbols } from '../../../../../libs/postgres/postgresModuleSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../addressModule/infrastructure/repositories/addressRepository/addressEntity/addressEntity';
import { AuthorBookRepositoryFactory } from '../../../../authorBookModule/application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookModule } from '../../../../authorBookModule/authorBookModule';
import { authorBookModuleSymbols } from '../../../../authorBookModule/authorBookModuleSymbols';
import { AuthorBookEntity } from '../../../../authorBookModule/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';
import { AuthorBookEntityTestFactory } from '../../../../authorBookModule/tests/factories/authorBookEntityTestFactory/authorBookEntityTestFactory';
import { BookCategoryEntity } from '../../../../bookCategoryModule/infrastructure/repositories/bookCategoryRepository/bookCategoryEntity/bookCategoryEntity';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { BookModule } from '../../../../bookModule/bookModule';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { BookEntity } from '../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryEntity } from '../../../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';
import { CustomerEntity } from '../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';
import { InventoryEntity } from '../../../../inventoryModule/infrastructure/repositories/inventoryRepository/inventoryEntity/inventoryEntity';
import { CartEntity } from '../../../../orderModule/infrastructure/repositories/cartRepository/cartEntity/cartEntity';
import { LineItemEntity } from '../../../../orderModule/infrastructure/repositories/lineItemRepository/lineItemEntity/lineItemEntity';
import { OrderEntity } from '../../../../orderModule/infrastructure/repositories/orderRepository/orderEntity/orderEntity';
import { ReviewEntity } from '../../../../reviewModule/infrastructure/repositories/reviewRepository/reviewEntity/reviewEntity';
import { UserEntity } from '../../../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';
import { AuthorModule } from '../../../authorModule';
import { authorModuleSymbols } from '../../../authorModuleSymbols';
import { AuthorNotFoundError } from '../../../infrastructure/errors/authorNotFoundError';
import { AuthorEntity } from '../../../infrastructure/repositories/authorRepository/authorEntity/authorEntity';
import { AuthorEntityTestFactory } from '../../../tests/factories/authorEntityTestFactory/authorEntityTestFactory';
import { AuthorRepositoryFactory } from '../../repositories/authorRepository/authorRepositoryFactory';

describe('AuthorServiceImpl', () => {
  let authorService: AuthorService;
  let authorRepositoryFactory: AuthorRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let authorBookRepositoryFactory: AuthorBookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
      CartEntity,
      LineItemEntity,
      OrderEntity,
      InventoryEntity,
      ReviewEntity,
    ],
  });

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new BookModule(),
        new AuthorModule(),
        new AuthorBookModule(),
        new LoggerModule(loggerModuleConfig),
        new UnitOfWorkModule(),
      ],
    });

    authorService = container.get<AuthorService>(authorModuleSymbols.authorService);
    authorRepositoryFactory = container.get<AuthorRepositoryFactory>(authorModuleSymbols.authorRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    authorBookRepositoryFactory = container.get<AuthorBookRepositoryFactory>(
      authorBookModuleSymbols.authorBookRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Create author', () => {
    it('creates author in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorService.createAuthor({ unitOfWork, draft: { firstName, lastName } });

        const foundAuthor = await authorRepository.findOne({ id: author.id });

        expect(foundAuthor).not.toBeNull();
      });
    });
  });

  describe('Find author', () => {
    it('finds author by id in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id, firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id, firstName, lastName });

        const foundAuthor = await authorService.findAuthor({ unitOfWork, authorId: author.id });

        expect(foundAuthor).not.toBeNull();
      });
    });

    it('should throw if author with given id does not exist in db', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorEntityTestFactory.create();

        try {
          await authorService.findAuthor({ unitOfWork, authorId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFoundError);
        }
      });
    });
  });

  describe('Find authors', () => {
    it('finds authors by one condition in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: id1, firstName: firstName1, lastName: lastName1 } = authorEntityTestFactory.create();

        const { id: id2, firstName: firstName2, lastName: lastName2 } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id: id1, firstName: firstName1, lastName: lastName1 });

        await authorRepository.createOne({ id: id2, firstName: firstName2, lastName: lastName2 });

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'firstName',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [firstName1],
        };

        const foundAuthors = await authorService.findAuthors({
          unitOfWork,
          filters: [equalFilterForFirstNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(foundAuthors.length).toBe(1);
        expect(foundAuthors[0]).toStrictEqual(author);
      });
    });

    it('finds authors by two conditions in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: id1, firstName: firstName1, lastName: lastName1 } = authorEntityTestFactory.create();

        const { id: id2, firstName: firstName2, lastName: lastName2 } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id: id1, firstName: firstName1, lastName: lastName1 });

        await authorRepository.createOne({ id: id2, firstName: firstName2, lastName: lastName2 });

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'firstName',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [firstName1],
        };

        const equalFilterForLastNameField: EqualFilter = {
          fieldName: 'lastName',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [lastName1],
        };

        const foundAuthors = await authorService.findAuthors({
          unitOfWork,
          filters: [equalFilterForFirstNameField, equalFilterForLastNameField],
          pagination: {
            page: 1,
            limit: 5,
          },
        });

        expect(foundAuthors.length).toBe(1);
        expect(foundAuthors[0]).toStrictEqual(author);
      });
    });

    it('finds authors in database limited by pagination', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id: id1, firstName, lastName: lastName1 } = authorEntityTestFactory.create();

        const { id: id2, lastName: lastName2 } = authorEntityTestFactory.create();

        const { id: id3, lastName: lastName3 } = authorEntityTestFactory.create();

        await authorRepository.createOne({ id: id1, firstName, lastName: lastName1 });

        await authorRepository.createOne({ id: id2, firstName, lastName: lastName2 });

        await authorRepository.createOne({ id: id3, firstName, lastName: lastName3 });

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'firstName',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [firstName],
        };

        const foundAuthors = await authorService.findAuthors({
          unitOfWork,
          filters: [equalFilterForFirstNameField],
          pagination: {
            page: 1,
            limit: 2,
          },
        });

        expect(foundAuthors.length).toBe(2);
      });
    });
  });

  describe('Find authors by book id', () => {
    it('finds authors by book id with filtering in database', async () => {
      expect.assertions(3);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const authorBookRepository = authorBookRepositoryFactory.create(entityManager);

        const { id: bookId, title, isbn, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const { id: authorId1, firstName: firstName1, lastName: lastName1 } = authorEntityTestFactory.create();

        const { id: authorId2, firstName: firstName2, lastName: lastName2 } = authorEntityTestFactory.create();

        const { id: authorId3, firstName: firstName3, lastName: lastName3 } = authorEntityTestFactory.create();

        const { id: authorBookId1 } = authorBookEntityTestFactory.create();

        const { id: authorBookId2 } = authorBookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id: bookId,
          title,
          isbn,
          releaseYear,
          language,
          format,
          price,
        });

        const author1 = await authorRepository.createOne({
          id: authorId1,
          firstName: firstName1,
          lastName: lastName1,
        });

        const author2 = await authorRepository.createOne({
          id: authorId2,
          firstName: firstName2,
          lastName: lastName2,
        });

        await authorRepository.createOne({
          id: authorId3,
          firstName: firstName3,
          lastName: lastName3,
        });

        await authorBookRepository.createOne({ id: authorBookId1, bookId: book.id, authorId: author1.id });

        await authorBookRepository.createOne({ id: authorBookId2, bookId: book.id, authorId: author2.id });

        const equalFilterForFirstNameField: EqualFilter = {
          fieldName: 'firstName',
          filterName: FilterName.equal,
          filterSymbol: FilterSymbol.equal,
          values: [firstName1],
        };

        const foundAuthors = await authorService.findAuthorsByBookId({
          unitOfWork,
          bookId: book.id,
          filters: [equalFilterForFirstNameField],
          pagination: { page: 1, limit: 5 },
        });

        expect(foundAuthors.length).toBe(1);
        expect(foundAuthors[0]?.firstName).toBe(author1.firstName);
        expect(foundAuthors[0]?.lastName).toBe(author1.lastName);
      });
    });
  });

  describe('Update author', () => {
    it('updates author in database', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id, firstName, lastName, about } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id, firstName, lastName });

        const updatedAuthor = await authorService.updateAuthor({
          unitOfWork,
          authorId: author.id,
          draft: { about: about as string },
        });

        expect(updatedAuthor).not.toBeNull();
        expect(updatedAuthor.about).toBe(about);
      });
    });

    it('should not update author and throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id, about } = authorEntityTestFactory.create();

        try {
          await authorService.updateAuthor({ unitOfWork, authorId: id, draft: { about: about as string } });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFoundError);
        }
      });
    });
  });

  describe('Delete author', () => {
    it('deletes author from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();
        const authorRepository = authorRepositoryFactory.create(entityManager);

        const { id, firstName, lastName } = authorEntityTestFactory.create();

        const author = await authorRepository.createOne({ id, firstName, lastName });

        await authorService.deleteAuthor({ unitOfWork, authorId: author.id });

        const foundAuthor = await authorRepository.findOne({ id: author.id });

        expect(foundAuthor).toBeNull();
      });
    });

    it('should throw if author with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { id } = authorEntityTestFactory.create();

        try {
          await authorService.deleteAuthor({ unitOfWork, authorId: id });
        } catch (error) {
          expect(error).toBeInstanceOf(AuthorNotFoundError);
        }
      });
    });
  });
});