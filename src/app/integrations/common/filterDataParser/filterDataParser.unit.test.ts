import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import { FilterDataParser } from './filterDataParser';
import {
  EqualFilter,
  LessThanFilter,
  LessThanOrEqualFilter,
  GreaterThanFilter,
  GreaterThanOrEqualFilter,
  BetweenFilter,
  LikeFilter,
} from '../../../common/types/contracts/filter';
import { FilterName } from '../../../common/types/contracts/filterName';
import { FilterSymbol } from '../../../common/types/contracts/filterSymbol';

describe('FilterDataParser', () => {
  const filterFataParser = new FilterDataParser();

  describe('Empty input', () => {
    it('should return empty array when filter data is empty array', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: '[]',
        supportedFieldsFilters: { title: [FilterSymbol.equal] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return empty array when supported field filters data is empty', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["title||eq||lotr,harry potter"]`,
        supportedFieldsFilters: {},
      });

      expect(filterData.length).toBe(0);
    });
  });

  describe('Equal filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["title|eq|lotr,harry potter"]`,
          supportedFieldsFilters: { title: [FilterSymbol.lessThan] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["title||eq||lotr,harry potter"]`,
        supportedFieldsFilters: { title: [FilterSymbol.lessThan] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return EqualFilter when valid syntax with one entry is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = filterFataParser.parse({
        jsonData: `["title||eq||lotr"]`,
        supportedFieldsFilters: { title: [FilterSymbol.equal] },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.equal);
      expect((filterData[0] as EqualFilter).fieldName).toStrictEqual('title');
      expect((filterData[0] as EqualFilter).values).toStrictEqual(['lotr']);
    });

    it('should return EqualFilter when valid syntax with two entries is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = filterFataParser.parse({
        jsonData: `["author||eq||J.R.R. Tolkien,J.K. Rowling"]`,
        supportedFieldsFilters: {
          author: [FilterSymbol.equal],
        },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.equal);
      expect((filterData[0] as EqualFilter).fieldName).toStrictEqual('author');
      expect((filterData[0] as EqualFilter).values).toStrictEqual(['J.R.R. Tolkien', 'J.K. Rowling']);
    });
  });

  describe('Less than filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price|lt|10"]`,
          supportedFieldsFilters: { price: [FilterSymbol.lessThan] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price||lt||aaa"]`,
          supportedFieldsFilters: { price: [FilterSymbol.lessThan] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["price||lt||6"]`,
        supportedFieldsFilters: { price: [FilterSymbol.equal] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return LessThanFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = filterFataParser.parse({
        jsonData: `["price||lt||10"]`,
        supportedFieldsFilters: { price: [FilterSymbol.lessThan] },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.lessThan);
      expect((filterData[0] as LessThanFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as LessThanFilter).value).toStrictEqual(10);
    });
  });

  describe('Less than or equal filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price|lte|10"]`,
          supportedFieldsFilters: { price: [FilterSymbol.lessThanOrEqual] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price||lte||aaa"]`,
          supportedFieldsFilters: { price: [FilterSymbol.lessThanOrEqual] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["price||lte||6"]`,
        supportedFieldsFilters: { price: [FilterSymbol.equal] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return LessThanOrEqualFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = filterFataParser.parse({
        jsonData: `["price||lte||10"]`,
        supportedFieldsFilters: { price: [FilterSymbol.lessThanOrEqual] },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.lessThanOrEqual);
      expect((filterData[0] as LessThanOrEqualFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as LessThanOrEqualFilter).value).toStrictEqual(10);
    });
  });

  describe('Greater than filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price|gt|10"]`,
          supportedFieldsFilters: { price: [FilterSymbol.greaterThan] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price||gt||aaa"]`,
          supportedFieldsFilters: { price: [FilterSymbol.greaterThan] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["price||gt||6"]`,
        supportedFieldsFilters: { price: [FilterSymbol.equal] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return GreaterThanFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = filterFataParser.parse({
        jsonData: `["price||gt||10"]`,
        supportedFieldsFilters: { price: [FilterSymbol.greaterThan] },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.greaterThan);
      expect((filterData[0] as GreaterThanFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as GreaterThanFilter).value).toStrictEqual(10);
    });
  });

  describe('Greater than or equal filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price|gte|10"]`,
          supportedFieldsFilters: { price: [FilterSymbol.greaterThanOrEqual] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price||gte||aaa"]`,
          supportedFieldsFilters: { price: [FilterSymbol.greaterThanOrEqual] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["price||gte||6"]`,
        supportedFieldsFilters: { price: [FilterSymbol.equal] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return GreaterThanOrEqualFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = filterFataParser.parse({
        jsonData: `["price||gte||10"]`,
        supportedFieldsFilters: { price: [FilterSymbol.greaterThanOrEqual] },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.greaterThanOrEqual);
      expect((filterData[0] as GreaterThanOrEqualFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as GreaterThanOrEqualFilter).value).toStrictEqual(10);
    });
  });

  describe('Between filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price|between|10,50"]`,
          supportedFieldsFilters: { price: [FilterSymbol.between] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price||between||aaa,b"]`,
          supportedFieldsFilters: { price: [FilterSymbol.between] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when only one filter value is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["price||between||10"]`,
          supportedFieldsFilters: { price: [FilterSymbol.between] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["price||between||6,10"]`,
        supportedFieldsFilters: { price: [FilterSymbol.equal] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return GreaterThanOrEqualFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(5);

      const filterData = filterFataParser.parse({
        jsonData: `["price||between||10,20"]`,
        supportedFieldsFilters: { price: [FilterSymbol.between] },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.between);
      expect((filterData[0] as BetweenFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as BetweenFilter).from).toStrictEqual(10);
      expect((filterData[0] as BetweenFilter).to).toStrictEqual(20);
    });
  });

  describe('Like filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        filterFataParser.parse({
          jsonData: `["title|like|harry"]`,
          supportedFieldsFilters: { title: [FilterSymbol.like] },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["title||like||harry"]`,
        supportedFieldsFilters: { title: [FilterSymbol.lessThan] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return LikeFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = filterFataParser.parse({
        jsonData: `["title||like||harry"]`,
        supportedFieldsFilters: { title: [FilterSymbol.like] },
      });

      expect(filterData.length).toBe(1);
      expect(filterData[0]?.filterName).toEqual(FilterName.like);
      expect((filterData[0] as LikeFilter).fieldName).toStrictEqual('title');
      expect((filterData[0] as LikeFilter).value).toStrictEqual('harry');
    });
  });

  describe('Combined filters', () => {
    it('should return empty array when given two filters and none of them is supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["title||like||harry", "price||lte||50"]`,
        supportedFieldsFilters: { title: [], price: [] },
      });

      expect(filterData.length).toBe(0);
    });

    it('should return one filter when given two filters but one is not supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["title||like||harry", "price||lte||50"]`,
        supportedFieldsFilters: {
          title: [FilterSymbol.like],
          price: [],
        },
      });

      expect(filterData.length).toBe(1);
    });

    it('should return both filters when they are supported', () => {
      expect.assertions(1);

      const filterData = filterFataParser.parse({
        jsonData: `["title||like||harry", "price||lte||50"]`,
        supportedFieldsFilters: {
          title: [FilterSymbol.like],
          price: [FilterSymbol.lessThanOrEqual],
        },
      });

      expect(filterData.length).toBe(2);
    });
  });
});
