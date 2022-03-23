import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';

export class EqualFilter {
  public constructor(public readonly fieldName: string, public readonly values: Array<string>) {}
}

export class LessThanFilter {
  public constructor(public readonly fieldName: string, public readonly value: number) {}
}

export class LessThanOrEqualFilter {
  public constructor(public readonly fieldName: string, public readonly value: number) {}
}

export class GreaterThanFilter {
  public constructor(public readonly fieldName: string, public readonly value: number) {}
}

export class GreaterThanOrEqualFilter {
  public constructor(public readonly fieldName: string, public readonly value: number) {}
}

export class BetweenFilter {
  public constructor(public readonly fieldName: string, public readonly values: Array<number>) {}
}

export class LikeFilter {
  public constructor(public readonly fieldName: string, public readonly value: string) {}
}

const EQUAL_OPERATION_NAME = 'eq';
const LESS_THAN_OPERATION_NAME = 'lt';
const LESS_THAN_OR_EQUAL_OPERATION_NAME = 'lte';
const GREATER_THAN_OPERATION_NAME = 'gt';
const GREATER_THAN_OR_EQUAL_OPERATION_NAME = 'gte';
const BETWEEN_OPERATION_NAME = 'between';
const LIKE_OPERATION_NAME = 'like';

const TOKENS_SEPARATOR = '||';
const VALUES_SEPARATOR = ',';
const FIELD_NAME_INDEX = 0;
const OPERATION_NAME_INDEX = 1;
const VALUES_INDEX = 2;
const EXPECTED_NUMBER_OF_TOKENS = 3;

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

      if (tokens.length != EXPECTED_NUMBER_OF_TOKENS) {
        throw new InvalidFilterSyntaxError();
      }

      const fieldName = tokens[FIELD_NAME_INDEX];
      const operationName = tokens[OPERATION_NAME_INDEX];

      const supportedFieldFilters = supportedFieldsFilters.get(fieldName);

      if (!supportedFieldFilters || !supportedFieldFilters.includes(operationName)) {
        continue;
      }

      switch (operationName) {
        case EQUAL_OPERATION_NAME: {
          const values = tokens[VALUES_INDEX].split(VALUES_SEPARATOR);
          filters.push(new EqualFilter(fieldName, values));
          break;
        }
        case LESS_THAN_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new LessThanFilter(fieldName, value));
          break;
        }
        case LESS_THAN_OR_EQUAL_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new LessThanOrEqualFilter(fieldName, value));
          break;
        }
        case GREATER_THAN_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new GreaterThanFilter(fieldName, value));
          break;
        }
        case GREATER_THAN_OR_EQUAL_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new GreaterThanOrEqualFilter(fieldName, value));
          break;
        }
        case BETWEEN_OPERATION_NAME: {
          const values = tokens[VALUES_INDEX].split(VALUES_SEPARATOR).map((value) => {
            const numberValue = parseInt(value);
            if (!numberValue) {
              throw new InvalidFilterSyntaxError();
            }
            return numberValue;
          });

          if (values.length !== 2) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new BetweenFilter(fieldName, values));
          break;
        }
        case LIKE_OPERATION_NAME: {
          const value = tokens[VALUES_INDEX];
          filters.push(new LikeFilter(fieldName, value));
          break;
        }
      }
    }

    return filters;
  }
}
