import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import {
  BetweenFilter,
  EqualFilter,
  FilterDataParser,
  GreaterThanFilter,
  GreaterThanOrEqualFilter,
  LessThanFilter,
  LessThanOrEqualFilter,
} from './filterDataParser';

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

    it('should return equal filter when valid syntax with one entry is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(['title||eq||lotr'], new Map(Object.entries({ title: ['eq'] })));

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(EqualFilter);
      expect((filterData[0] as EqualFilter).fieldName).toStrictEqual('title');
      expect((filterData[0] as EqualFilter).values).toStrictEqual(['lotr']);
    });

    it('should return EqualFilter when valid syntax with two entries is provided and filter is supported', () => {
      expect.assertions(4);

      const filterData = FilterDataParser.parse(
        ['author||eq||J.R.R. Tolkien,J.K. Rowling'],
        new Map(Object.entries({ author: ['eq'] })),
      );

      expect(filterData.length).toBe(1);
      expect(filterData[0]).toBeInstanceOf(EqualFilter);
      expect((filterData[0] as EqualFilter).fieldName).toStrictEqual('author');
      expect((filterData[0] as EqualFilter).values).toStrictEqual(['J.R.R. Tolkien', 'J.K. Rowling']);
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
      expect(filterData[0]).toBeInstanceOf(LessThanFilter);
      expect((filterData[0] as LessThanFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as LessThanFilter).value).toStrictEqual(10);
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
      expect(filterData[0]).toBeInstanceOf(LessThanOrEqualFilter);
      expect((filterData[0] as LessThanOrEqualFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as LessThanOrEqualFilter).value).toStrictEqual(10);
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
      expect(filterData[0]).toBeInstanceOf(GreaterThanFilter);
      expect((filterData[0] as GreaterThanFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as GreaterThanFilter).value).toStrictEqual(10);
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
      expect(filterData[0]).toBeInstanceOf(GreaterThanOrEqualFilter);
      expect((filterData[0] as GreaterThanOrEqualFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as GreaterThanOrEqualFilter).value).toStrictEqual(10);
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
      expect(filterData[0]).toBeInstanceOf(BetweenFilter);
      expect((filterData[0] as BetweenFilter).fieldName).toStrictEqual('price');
      expect((filterData[0] as BetweenFilter).values).toStrictEqual([10, 20]);
    });
  });
});
