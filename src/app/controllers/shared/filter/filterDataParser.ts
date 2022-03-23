import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import {
  BetweenOperation,
  EqualOperation,
  GreaterThanOperation,
  GreaterThanOrEqualOperation,
  LessThanOperation,
  LessThanOrEqualOperation,
  LikeOperation,
} from './operations';

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
          filters.push(new EqualOperation(fieldName, values));
          break;
        }
        case LESS_THAN_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new LessThanOperation(fieldName, value));
          break;
        }
        case LESS_THAN_OR_EQUAL_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new LessThanOrEqualOperation(fieldName, value));
          break;
        }
        case GREATER_THAN_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new GreaterThanOperation(fieldName, value));
          break;
        }
        case GREATER_THAN_OR_EQUAL_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError();
          }

          filters.push(new GreaterThanOrEqualOperation(fieldName, value));
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

          filters.push(new BetweenOperation(fieldName, values));
          break;
        }
        case LIKE_OPERATION_NAME: {
          const value = tokens[VALUES_INDEX];
          filters.push(new LikeOperation(fieldName, value));
          break;
        }
      }
    }

    return filters;
  }
}
