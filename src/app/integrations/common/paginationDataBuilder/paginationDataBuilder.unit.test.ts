import 'reflect-metadata';

import { PaginationDataBuilder } from './paginationDataBuilder';

const defaultPage = 1;
const defaultLimit = 5;
const maxLimit = 20;

describe('PaginationDataBuilder', () => {
  const paginationDataBuilder = new PaginationDataBuilder();

  it('should set default values to page and limit properties when they are not provided', () => {
    expect.assertions(2);

    const pagination = paginationDataBuilder.build({});

    expect(pagination.page).toBe(defaultPage);
    expect(pagination.limit).toBe(defaultLimit);
  });

  it('should set default value to page property when page is less than 1', () => {
    expect.assertions(2);

    const pagination = paginationDataBuilder.build({ page: -1 });

    expect(pagination.page).toBe(defaultPage);
    expect(pagination.limit).toBe(defaultLimit);
  });

  it('should trim limit value when limit is more than 20', () => {
    expect.assertions(2);

    const pagination = paginationDataBuilder.build({ limit: 30 });

    expect(pagination.page).toBe(defaultPage);
    expect(pagination.limit).toBe(maxLimit);
  });

  it('should convert valid values into pagination data', () => {
    expect.assertions(2);

    const pagination = paginationDataBuilder.build({ page: 2, limit: 10 });

    expect(pagination.page).toBe(2);
    expect(pagination.limit).toBe(10);
  });
});
