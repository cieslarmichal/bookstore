import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import {
  BETWEEN_FILTER_NAME,
  EQUAL_FILTER_NAME,
  GREATER_THAN_FILTER_NAME,
  GREATER_THAN_OR_EQUAL_FILTER_NAME,
  LESS_THAN_FILTER_NAME,
  LESS_THAN_OR_EQUAL_FILTER_NAME,
  LIKE_FILTER_NAME,
  FilterFactory,
} from '../../../shared';

const TOKENS_SEPARATOR = '||';
const VALUES_SEPARATOR = ',';
const FIELD_NAME_INDEX = 0;
const OPERATION_NAME_INDEX = 1;
const VALUES_INDEX = 2;
const EXPECTED_NUMBER_OF_TOKENS = 3;

export class FilterDataParser {
  public static parse(filterDataAsJson: string, supportedFieldsFilters: Map<string, Array<string>>): Array<any> {
    if (!filterDataAsJson) {
      return [];
    }

    if (!supportedFieldsFilters) {
      return [];
    }

    let filterData: Array<string>;

    try {
      filterData = JSON.parse(filterDataAsJson);
    } catch (error) {
      throw new InvalidFilterSyntaxError('filter data is not valid json object');
    }

    const filters = new Array<any>();

    for (const fieldData of filterData) {
      const tokens = fieldData.split(TOKENS_SEPARATOR);

      if (tokens.length != EXPECTED_NUMBER_OF_TOKENS) {
        throw new InvalidFilterSyntaxError('number of tokens in filter element is not equal 3');
      }

      const fieldName = tokens[FIELD_NAME_INDEX];
      const filterName = tokens[OPERATION_NAME_INDEX];

      const supportedFieldFilters = supportedFieldsFilters.get(fieldName);

      if (!supportedFieldFilters || !supportedFieldFilters.includes(filterName)) {
        continue;
      }

      switch (filterName) {
        case EQUAL_FILTER_NAME: {
          const values = tokens[VALUES_INDEX].split(VALUES_SEPARATOR);

          filters.push(FilterFactory.create(EQUAL_FILTER_NAME, fieldName, values));

          break;
        }
        case LESS_THAN_FILTER_NAME:
        case LESS_THAN_OR_EQUAL_FILTER_NAME:
        case GREATER_THAN_FILTER_NAME:
        case GREATER_THAN_OR_EQUAL_FILTER_NAME: {
          const value = parseInt(tokens[VALUES_INDEX]);

          if (!value) {
            throw new InvalidFilterSyntaxError('value is not a number');
          }

          filters.push(FilterFactory.create(filterName, fieldName, value));

          break;
        }
        case BETWEEN_FILTER_NAME: {
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

          filters.push(FilterFactory.create(BETWEEN_FILTER_NAME, fieldName, values));

          break;
        }
        case LIKE_FILTER_NAME: {
          const value = tokens[VALUES_INDEX];

          filters.push(FilterFactory.create(LIKE_FILTER_NAME, fieldName, value));

          break;
        }
      }
    }

    return filters;
  }
}
