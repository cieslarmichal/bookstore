import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import { Filter } from '../../../common/filter/filter';
import { FilterFactory } from '../../../common/filter/filterFactory';
import { FilterName } from '../../../common/filter/filterName';

export class FilterDataParser {
  private readonly tokensSeparator = '||';
  private readonly valuesSeparator = ',';
  private readonly fieldNameIndex = 0;
  private readonly operationNameIndex = 1;
  private readonly valuesIndex = 2;
  private readonly numberOfTokensInFilterElement = 3;

  public parse(filterDataAsJson: string, supportedFieldsFilters: Map<string, Array<string>>): Filter[] {
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
      throw new InvalidFilterSyntaxError({ errorDetails: 'filter data is not valid json object' });
    }

    const filters: Filter[] = [];

    for (const fieldData of filterData) {
      const tokens = fieldData.split(this.tokensSeparator);

      if (tokens.length != this.numberOfTokensInFilterElement) {
        throw new InvalidFilterSyntaxError({ errorDetails: 'number of tokens in filter element is not equal 3' });
      }

      const fieldName = tokens[this.fieldNameIndex];
      const filterName = tokens[this.operationNameIndex];

      if (!fieldName) {
        throw new InvalidFilterSyntaxError({ errorDetails: 'field name not defined' });
      }

      if (!filterName) {
        throw new InvalidFilterSyntaxError({ errorDetails: 'field name not defined' });
      }

      const supportedFieldFilters = supportedFieldsFilters.get(fieldName);

      if (!supportedFieldFilters || !supportedFieldFilters.includes(filterName)) {
        continue;
      }

      switch (filterName) {
        case FilterName.equal: {
          const tokenValues = tokens[this.valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const splitValues = tokenValues.split(this.valuesSeparator);

          filters.push(FilterFactory.create(FilterName.equal, fieldName, splitValues));

          break;
        }
        case FilterName.lessThan:
        case FilterName.lessThanOrEqual:
        case FilterName.greaterThan:
        case FilterName.greaterThanOrEqual: {
          const tokenValues = tokens[this.valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const value = parseInt(tokenValues);

          if (!value) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'value is not a number' });
          }

          filters.push(FilterFactory.create(filterName, fieldName, value));

          break;
        }
        case FilterName.between: {
          const tokenValues = tokens[this.valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const splitValues = tokenValues.split(this.valuesSeparator).map((tokenValue) => {
            const numberValue = parseInt(tokenValue);

            if (!numberValue) {
              throw new InvalidFilterSyntaxError({ errorDetails: 'one of the values is not a number' });
            }

            return numberValue;
          });

          if (splitValues.length !== 2) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'number of values is not 2' });
          }

          filters.push(FilterFactory.create(FilterName.between, fieldName, splitValues));

          break;
        }
        case FilterName.like: {
          const value = tokens[this.valuesIndex];

          filters.push(FilterFactory.create(FilterName.like, fieldName, value));

          break;
        }
      }
    }

    return filters;
  }
}
