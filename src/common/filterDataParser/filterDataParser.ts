import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import { ParsePayload, parsePayloadSchema } from './payloads/parsePayload';
import { Validator } from '../../libs/validator/implementations/validator';
import { Filter } from '../types/contracts/filter';
import { FilterName } from '../types/contracts/filterName';
import { FilterSymbol } from '../types/contracts/filterSymbol';

const tokensSeparator = '||';
const valuesSeparator = ',';
const fieldNameIndex = 0;
const operationNameIndex = 1;
const valuesIndex = 2;
const numberOfTokensInFilterElement = 3;

export class FilterDataParser {
  public static parse(input: ParsePayload): Filter[] {
    const { jsonData, supportedFieldsFilters } = Validator.validate(parsePayloadSchema, input);

    if (!supportedFieldsFilters) {
      return [];
    }

    let filterData: Array<string>;

    try {
      filterData = JSON.parse(jsonData);
    } catch (error) {
      throw new InvalidFilterSyntaxError({ errorDetails: 'filter data is not valid json object' });
    }

    const filters: Filter[] = [];

    for (const fieldData of filterData) {
      const tokens = fieldData.split(tokensSeparator);

      if (tokens.length != numberOfTokensInFilterElement) {
        throw new InvalidFilterSyntaxError({ errorDetails: 'number of tokens in filter element is not equal 3' });
      }

      const fieldName = tokens[fieldNameIndex];

      const filterSymbol = tokens[operationNameIndex] as FilterSymbol;

      if (!fieldName) {
        throw new InvalidFilterSyntaxError({ errorDetails: 'field name not defined' });
      }

      if (!filterSymbol) {
        throw new InvalidFilterSyntaxError({ errorDetails: 'filter symbol not defined' });
      }

      const supportedFieldFilters = supportedFieldsFilters[fieldName];

      if (!supportedFieldFilters || !supportedFieldFilters.includes(filterSymbol)) {
        continue;
      }

      switch (filterSymbol) {
        case FilterSymbol.equal: {
          const tokenValues = tokens[valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const splitValues = tokenValues.split(valuesSeparator);

          const equalFilter: Filter = { filterName: FilterName.equal, filterSymbol, fieldName, values: splitValues };

          filters.push(equalFilter);

          break;
        }
        case FilterSymbol.lessThan: {
          const tokenValues = tokens[valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const value = parseInt(tokenValues);

          if (!value) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'value is not a number' });
          }

          const lessThanFilter: Filter = { filterName: FilterName.lessThan, filterSymbol, fieldName, value };

          filters.push(lessThanFilter);

          break;
        }
        case FilterSymbol.lessThanOrEqual: {
          const tokenValues = tokens[valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const value = parseInt(tokenValues);

          if (!value) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'value is not a number' });
          }

          const lessThanOrEqualFilter: Filter = {
            filterName: FilterName.lessThanOrEqual,
            filterSymbol,
            fieldName,
            value,
          };

          filters.push(lessThanOrEqualFilter);

          break;
        }
        case FilterSymbol.greaterThan: {
          const tokenValues = tokens[valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const value = parseInt(tokenValues);

          if (!value) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'value is not a number' });
          }

          const greaterThanFilter: Filter = {
            filterName: FilterName.greaterThan,
            filterSymbol,
            fieldName,
            value,
          };

          filters.push(greaterThanFilter);

          break;
        }
        case FilterSymbol.greaterThanOrEqual: {
          const tokenValues = tokens[valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const value = parseInt(tokenValues);

          if (!value) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'value is not a number' });
          }

          const greaterThanOrEqualFilter: Filter = {
            filterName: FilterName.greaterThanOrEqual,
            filterSymbol,
            fieldName,
            value,
          };

          filters.push(greaterThanOrEqualFilter);

          break;
        }
        case FilterSymbol.between: {
          const tokenValues = tokens[valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const splitValues = tokenValues.split(valuesSeparator).map((tokenValue) => {
            const numberValue = parseInt(tokenValue);

            if (!numberValue) {
              throw new InvalidFilterSyntaxError({ errorDetails: 'one of the values is not a number' });
            }

            return numberValue;
          });

          if (splitValues.length !== 2) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'number of values is not 2' });
          }

          const betweenFilter: Filter = {
            filterName: FilterName.between,
            filterSymbol,
            fieldName,
            from: splitValues[0] as number,
            to: splitValues[1] as number,
          };

          filters.push(betweenFilter);

          break;
        }
        case FilterSymbol.like: {
          const value = tokens[valuesIndex];

          const likeFilter: Filter = {
            filterName: FilterName.like,
            filterSymbol,
            fieldName,
            value: value as string,
          };

          filters.push(likeFilter);

          break;
        }
      }
    }

    return filters;
  }
}
