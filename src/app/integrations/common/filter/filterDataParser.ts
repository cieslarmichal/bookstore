import { FilterFactory } from '../../../common/filter/filterFactory';
import { FilterName } from '../../../common/filter/filterName';
import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';

export class FilterDataParser {
  private readonly tokensSeparator = '||';
  private readonly valuesSeparator = ',';
  private readonly fieldNameIndex = 0;
  private readonly operationNameIndex = 1;
  private readonly valuesIndex = 2;
  private readonly numberOfTokensInFilterElement = 3;

  public parse(filterDataAsJson: string, supportedFieldsFilters: Map<string, Array<string>>): Array<any> {
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
      const tokens = fieldData.split(this.tokensSeparator);

      if (tokens.length != this.numberOfTokensInFilterElement) {
        throw new InvalidFilterSyntaxError('number of tokens in filter element is not equal 3');
      }

      const fieldName = tokens[this.fieldNameIndex];
      const filterName = tokens[this.operationNameIndex];

      const supportedFieldFilters = supportedFieldsFilters.get(fieldName);

      if (!supportedFieldFilters || !supportedFieldFilters.includes(filterName)) {
        continue;
      }

      switch (filterName) {
        case FilterName.equal: {
          const values = tokens[this.valuesIndex].split(this.valuesSeparator);

          filters.push(FilterFactory.create(FilterName.equal, fieldName, values));

          break;
        }
        case FilterName.lessThan:
        case FilterName.lessThanOrEqual:
        case FilterName.greaterThan:
        case FilterName.greaterThanOrEqual: {
          const value = parseInt(tokens[this.valuesIndex]);

          if (!value) {
            throw new InvalidFilterSyntaxError('value is not a number');
          }

          filters.push(FilterFactory.create(filterName, fieldName, value));

          break;
        }
        case FilterName.between: {
          const values = tokens[this.valuesIndex].split(this.valuesSeparator).map((value) => {
            const numberValue = parseInt(value);

            if (!numberValue) {
              throw new InvalidFilterSyntaxError('one of the values is not a number');
            }
            return numberValue;
          });

          if (values.length !== 2) {
            throw new InvalidFilterSyntaxError('number of values is not 2');
          }

          filters.push(FilterFactory.create(FilterName.between, fieldName, values));

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
