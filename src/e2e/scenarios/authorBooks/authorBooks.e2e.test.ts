import 'reflect-metadata';

describe(`Author books e2e`, () => {
  const authorBookEntityTestFactory = new AuthorBookEntityTestFactory();
  const authorEntityTestFactory = new AuthorEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  describe('Create authorBook', () => {
    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const { authorId, bookId } = authorBookEntityTestFactory.create();

      const response = await request(server.instance).post(`${authorsUrl}/${authorId}/books/${bookId}`);

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('returns not found when author or book corresponding to authorId and bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const { authorId, bookId } = authorBookEntityTestFactory.create();

      const accessToken = tokenService.createToken({ userId });

      const response = await request(server.instance)
        .post(`${authorsUrl}/${authorId}/books/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const { id: bookId, isbn, format, language, price, releaseYear, title } = bookEntityTestFactory.create();

      const { id: authorId, firstName, lastName } = authorEntityTestFactory.create();

      const accessToken = tokenService.createToken({ userId });

      const book = await bookRepository.createOne({
        id: bookId,
        format,
        isbn,
        language,
        price,
        releaseYear,
        title,
      });

      const author = await authorRepository.createOne({ id: authorId, firstName, lastName });

      const response = await request(server.instance)
        .post(`${authorsUrl}/${author.id}/books/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(HttpStatusCode.created);
    });
  });

  describe('Delete authorBook', () => {
    it('returns not found when authorBook with authorId and bookId does not exist', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const { authorId, bookId } = authorBookEntityTestFactory.create();

      const accessToken = tokenService.createToken({ userId });

      const response = await request(server.instance)
        .delete(`${authorsUrl}/${authorId}/books/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(HttpStatusCode.notFound);
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      const bookEntity = bookEntityTestFactory.create();

      const authorEntity = authorEntityTestFactory.create();

      const { id: authorBookId } = authorBookEntityTestFactory.create();

      const book = await bookRepository.createOne({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      const author = await authorRepository.createOne({
        id: authorEntity.id,
        firstName: authorEntity.firstName,
        lastName: authorEntity.lastName,
      });

      await authorBookRepository.createOne({ id: authorBookId, authorId: author.id, bookId: book.id });

      const response = await request(server.instance).delete(`${authorsUrl}/${author.id}/books/${book.id}`).send();

      expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
    });

    it('accepts a request and returns no content when authorBookId is uuid and corresponds to existing authorBook', async () => {
      expect.assertions(1);

      const { id: userId } = userEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const authorEntity = authorEntityTestFactory.create();

      const { id: authorBookId } = authorBookEntityTestFactory.create();

      const accessToken = tokenService.createToken({ userId });

      const book = await bookRepository.createOne({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      const author = await authorRepository.createOne({
        id: authorEntity.id,
        firstName: authorEntity.firstName,
        lastName: authorEntity.lastName,
      });

      await authorBookRepository.createOne({ id: authorBookId, authorId: author.id, bookId: book.id });

      const response = await request(server.instance)
        .delete(`${authorsUrl}/${author.id}/books/${book.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(response.statusCode).toBe(HttpStatusCode.noContent);
    });
  });
});
