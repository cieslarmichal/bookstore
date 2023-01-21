import { PaginationDataParser } from './paginationDataParser';

const defaultPage = 1;
const defaultLimit = 5;
const maxLimit = 20;

describe('PaginationDataParser', () => {
  it('should set default values to page and limit properties when they are not provided', () => {
    expect.assertions(2);

    const paginationData = PaginationDataParser.parse({});

    expect(paginationData.page).toBe(defaultPage);
    expect(paginationData.limit).toBe(defaultLimit);
  });

  it('should set default value to page property when page is less than 1', () => {
    expect.assertions(2);

    const paginationData = PaginationDataParser.parse({ page: -1 });

    expect(paginationData.page).toBe(defaultPage);
    expect(paginationData.limit).toBe(defaultLimit);
  });

  it('should trim limit value when limit is more than 20', () => {
    expect.assertions(2);

    const paginationData = PaginationDataParser.parse({ limit: 30 });

    expect(paginationData.page).toBe(defaultPage);
    expect(paginationData.limit).toBe(maxLimit);
  });

  it('should convert valid values into pagination data', () => {
    expect.assertions(2);

    const paginationData = PaginationDataParser.parse({ page: 2, limit: 10 });

    expect(paginationData.page).toBe(2);
    expect(paginationData.limit).toBe(10);
  });
});
