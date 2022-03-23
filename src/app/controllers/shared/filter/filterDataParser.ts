import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';

export class EqualFilter {
  public constructor(public readonly fieldName: string, public readonly values: Array<string>) {}
}

// class LessThanFilter {
//   public field: string;
//   public value: number;
// }

// class LessThanOrEqualFilter {
//   public field: string;
//   public value: number;
// }

// class GreaterThanFilter {
//   public field: string;
//   public value: number;
// }

// class GreaterThanOrEqualFilter {
//   public field: string;
//   public value: number;
// }

// class BetweenFilter {
//   public field: string;
//   public values: Array<number>;
// }

// class LikeFilter {
//   public field: string;
//   public value: string;
// }

const EQUAL_OPERATION_NAME = 'eq';
// const LESS_THAN_OPERATION_NAME = 'lt';
// const LESS_THAN_OR_EQUAL_OPERATION_NAME = 'lte';
// const GREATER_THAN_OPERATION_NAME = 'gt';
// const GREATER_THAN_OR_EQUAL_OPERATION_NAME = 'gte';
// const BETWEEN_OPERATION_NAME = 'between';
// const LIKE_OPERATION_NAME = 'like';

const TOKENS_SEPARATOR = '||';
const VALUES_SEPARATOR = ',';
const EXPECTED_NUMBER_OF_SEPARATED_TOKENS = 3;
const FIELD_NAME_INDEX = 0;
const OPERATION_NAME_INDEX = 1;
const VALUES_INDEX = 2;

export class FilterDataParser {
  public static parse(filterData: Array<string>, supportedFieldsFilters: Map<string, Array<string>>): Array<any> {
    if (!filterData) {
      return [];
    }

    if (!supportedFieldsFilters) {
      return [];
    }

    const filters = new Array<any>();

    for (const fieldData of filterData) {
      const tokens = fieldData.split(TOKENS_SEPARATOR);

      if (tokens.length != EXPECTED_NUMBER_OF_SEPARATED_TOKENS) {
        throw new InvalidFilterSyntaxError();
      }

      const fieldName = tokens[FIELD_NAME_INDEX];
      const operationName = tokens[OPERATION_NAME_INDEX];

      const supportedFieldFilters = supportedFieldsFilters.get(fieldName);

      if (!supportedFieldFilters || !supportedFieldFilters.includes(operationName)) {
        continue;
      }

      if (operationName === EQUAL_OPERATION_NAME) {
        const values = tokens[VALUES_INDEX].split(VALUES_SEPARATOR);

        const equalFilter = new EqualFilter(fieldName, values);

        filters.push(equalFilter);
      }
    }

    return filters;
  }
}
