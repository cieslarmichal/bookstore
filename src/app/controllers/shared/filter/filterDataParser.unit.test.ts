import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import { FilterDataParser } from './filterDataParser';
import {
  BetweenOperation,
  EqualOperation,
  GreaterThanOperation,
  GreaterThanOrEqualOperation,
  LessThanOperation,
  LessThanOrEqualOperation,
  LikeOperation,
} from './operations';

describe('FilterDataParser', () => {
  describe('Empty input', () => {
    it('should return empty array when filter data is empty', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse([], new Map(Object.entries({ title: ['eq'] })));

      expect(filterData.length).toBe(0);
    });

    it('should return empty array when supported field filters data is empty', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(['title||eq||lotr,harry potter'], new Map());

      expect(filterData.length).toBe(0);
    });
  });

  describe('Equal filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['title|eq|lotr,harry potter'], new Map(Object.entries({ title: ['lt'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(
        ['title||eq||lotr,harry potter'],
        new Map(Object.entries({ title: ['lt'] })),
      );

      expect(filterData.length).toBe(0);
    });

    it('should return EqualFilter when valid syntax with one entry is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(['title||eq||lotr'], new Map(Object.entries({ title: ['eq'] })));

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(EqualOperation);
      expect((filterData[0] as EqualOperation).fieldName).toStrictEqual('title');
      expect((filterData[0] as EqualOperation).values).toStrictEqual(['lotr']);
    });

    it('should return EqualFilter when valid syntax with two entries is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(
        ['author||eq||J.R.R. Tolkien,J.K. Rowling'],
        new Map(Object.entries({ author: ['eq'] })),
      );

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(EqualOperation);
      expect((filterData[0] as EqualOperation).fieldName).toStrictEqual('author');
      expect((filterData[0] as EqualOperation).values).toStrictEqual(['J.R.R. Tolkien', 'J.K. Rowling']);
    });
  });

  describe('Less than filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price|lt|10'], new Map(Object.entries({ price: ['lt'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price||lt||aaa'], new Map(Object.entries({ price: ['lt'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(['price||lt||6'], new Map(Object.entries({ price: ['eq'] })));

      expect(filterData.length).toBe(0);
    });

    it('should return LessThanFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(['price||lt||10'], new Map(Object.entries({ price: ['lt'] })));

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(LessThanOperation);
      expect((filterData[0] as LessThanOperation).fieldName).toStrictEqual('price');
      expect((filterData[0] as LessThanOperation).value).toStrictEqual(10);
    });
  });

  describe('Less than or equal filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price|lte|10'], new Map(Object.entries({ price: ['lte'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price||lte||aaa'], new Map(Object.entries({ price: ['lte'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(['price||lte||6'], new Map(Object.entries({ price: ['eq'] })));

      expect(filterData.length).toBe(0);
    });

    it('should return LessThanOrEqualFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(['price||lte||10'], new Map(Object.entries({ price: ['lte'] })));

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(LessThanOrEqualOperation);
      expect((filterData[0] as LessThanOrEqualOperation).fieldName).toStrictEqual('price');
      expect((filterData[0] as LessThanOrEqualOperation).value).toStrictEqual(10);
    });
  });

  describe('Greater than filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price|gt|10'], new Map(Object.entries({ price: ['gt'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price||gt||aaa'], new Map(Object.entries({ price: ['gt'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(['price||gt||6'], new Map(Object.entries({ price: ['eq'] })));

      expect(filterData.length).toBe(0);
    });

    it('should return GreaterThanFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(['price||gt||10'], new Map(Object.entries({ price: ['gt'] })));

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(GreaterThanOperation);
      expect((filterData[0] as GreaterThanOperation).fieldName).toStrictEqual('price');
      expect((filterData[0] as GreaterThanOperation).value).toStrictEqual(10);
    });
  });

  describe('Greater than or equal filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price|gte|10'], new Map(Object.entries({ price: ['gte'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price||gte||aaa'], new Map(Object.entries({ price: ['gte'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(['price||gte||6'], new Map(Object.entries({ price: ['eq'] })));

      expect(filterData.length).toBe(0);
    });

    it('should return GreaterThanOrEqualFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(['price||gte||10'], new Map(Object.entries({ price: ['gte'] })));

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(GreaterThanOrEqualOperation);
      expect((filterData[0] as GreaterThanOrEqualOperation).fieldName).toStrictEqual('price');
      expect((filterData[0] as GreaterThanOrEqualOperation).value).toStrictEqual(10);
    });
  });

  describe('Between filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price|between|10,50'], new Map(Object.entries({ price: ['between'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when filter value is not a number', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price||between||aaa,b'], new Map(Object.entries({ price: ['between'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should throw when only one filter value is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['price||between||10'], new Map(Object.entries({ price: ['between'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(['price||between||6,10'], new Map(Object.entries({ price: ['eq'] })));

      expect(filterData.length).toBe(0);
    });

    it('should return GreaterThanOrEqualFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(
        ['price||between||10,20'],
        new Map(Object.entries({ price: ['between'] })),
      );

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(BetweenOperation);
      expect((filterData[0] as BetweenOperation).fieldName).toStrictEqual('price');
      expect((filterData[0] as BetweenOperation).values).toStrictEqual([10, 20]);
    });
  });

  describe('Like filter', () => {
    it('should throw when invalid syntax is provided', () => {
      expect.assertions(1);

      try {
        FilterDataParser.parse(['title|like|harry'], new Map(Object.entries({ title: ['like'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(['title||like||harry'], new Map(Object.entries({ title: ['lt'] })));

      expect(filterData.length).toBe(0);
    });

    it('should return LikeFilter when valid syntax is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(['title||like||harry'], new Map(Object.entries({ title: ['like'] })));

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(LikeOperation);
      expect((filterData[0] as LikeOperation).fieldName).toStrictEqual('title');
      expect((filterData[0] as LikeOperation).value).toStrictEqual('harry');
    });
  });

  describe('Combined filters', () => {
    it('should return empty array when given two filters and none of them is supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(
        ['title||like||harry', 'price||lte||50'],
        new Map(Object.entries({ title: [], price: [] })),
      );

      expect(filterData.length).toBe(0);
    });

    it('should return one filter when given two filters but one is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(
        ['title||like||harry', 'price||lte||50'],
        new Map(Object.entries({ title: ['like'], price: [] })),
      );

      expect(filterData.length).toBe(1);
    });

    it('should return both filters when they are supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(
        ['title||like||harry', 'price||lte||50'],
        new Map(Object.entries({ title: ['like'], price: ['lte'] })),
      );

      expect(filterData.length).toBe(2);
    });
  });
});
