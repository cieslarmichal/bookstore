import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import { EqualFilter, FilterDataParser } from './filterDataParser';

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
        FilterDataParser.parse(['title|eq|lotr,harry potter'], new Map(Object.entries({ title: ['le'] })));
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidFilterSyntaxError);
      }
    });

    it('should return empty array when valid syntax is provided but filter is not supported', () => {
      expect.assertions(1);

      const filterData = FilterDataParser.parse(
        ['title||eq||lotr,harry potter'],
        new Map(Object.entries({ title: ['le'] })),
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

    it('should return equal filter when valid syntax with two entries is provided and filter is supported', () => {
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
});
