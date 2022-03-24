import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import {
  BETWEEN_OPERATION_NAME,
  EQUAL_OPERATION_NAME,
  GREATER_THAN_OPERATION_NAME,
  GREATER_THAN_OR_EQUAL_OPERATION_NAME,
  LESS_THAN_OPERATION_NAME,
  LESS_THAN_OR_EQUAL_OPERATION_NAME,
  LIKE_OPERATION_NAME,
  OperationFactory,
} from './operations';

const TOKENS_SEPARATOR = '||';
const VALUES_SEPARATOR = ',';
const FIELD_NAME_INDEX = 0;
const OPERATION_NAME_INDEX = 1;
const VALUES_INDEX = 2;
const EXPECTED_NUMBER_OF_TOKENS = 3;

export class FilterDataParser {
  public static parse(filterDataAsJson: string, supportedFieldsFilters: Map<string, Array<string>>): Array<any> {
    let filterData: Array<string>;

    try {
      filterData = JSON.parse(filterDataAsJson);
    } catch (error) {
      throw new InvalidFilterSyntaxError('filter data is not valid json object');
    }

    if (!filterData) {
      return [];
    }

    if (!supportedFieldsFilters) {
      return [];
    }

    const filters = new Array<any>();

    for (const fieldData of filterData) {
      console.log(fieldData);
      const tokens = fieldData.split(TOKENS_SEPARATOR);
      console.log(tokens);
      if (tokens.length != EXPECTED_NUMBER_OF_TOKENS) {
        throw new InvalidFilterSyntaxError('number of tokens in filter element is not equal 3');
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

          filters.push(OperationFactory.create(EQUAL_OPERATION_NAME, fieldName, values));

          break;
        }
        case LESS_THAN_OPERATION_NAME:
        case LESS_THAN_OR_EQUAL_OPERATION_NAME:
        case GREATER_THAN_OPERATION_NAME:
        case GREATER_THAN_OR_EQUAL_OPERATION_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError('value is not a number');
          }

          filters.push(OperationFactory.create(operationName, fieldName, value));

          break;
        }
        case BETWEEN_OPERATION_NAME: {
          const values = tokens[VALUES_INDEX].split(VALUES_SEPARATOR).map((value) => {
            const numberValue = parseInt(value);

            if (!numberValue) {
              throw new InvalidFilterSyntaxError('one of the values is not a number');
            }
            return numberValue;
          });

          if (values.length !== 2) {
            throw new InvalidFilterSyntaxError('number of values is not 2');
          }

          filters.push(OperationFactory.create(BETWEEN_OPERATION_NAME, fieldName, values));

          break;
        }
        case LIKE_OPERATION_NAME: {
          const value = tokens[VALUES_INDEX];

          filters.push(OperationFactory.create(LIKE_OPERATION_NAME, fieldName, value));

          break;
        }
      }
    }

    return filters;
  }
}
