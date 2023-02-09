import { InvalidFilterSyntaxError } from './errors/invalidFilterSyntaxError';
import { ParsePayload, parsePayloadSchema } from './parsePayload';
import { Filter } from '../../../common/types/contracts/filter';
import { FilterName } from '../../../common/types/contracts/filterName';
import { FilterSymbol } from '../../../common/types/contracts/filterSymbol';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Injectable } from '../../../libs/dependencyInjection/contracts/decorators';

@Injectable()
export class FilterDataParser {
  private readonly tokensSeparator = '||';
  private readonly valuesSeparator = ',';
  private readonly fieldNameIndex = 0;
  private readonly operationNameIndex = 1;
  private readonly valuesIndex = 2;
  private readonly numberOfTokensInFilterElement = 3;

  public parse(input: ParsePayload): Filter[] {
    const { jsonData, supportedFieldsFilters } = PayloadFactory.create(parsePayloadSchema, input);

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
      const tokens = fieldData.split(this.tokensSeparator);

      if (tokens.length != this.numberOfTokensInFilterElement) {
        throw new InvalidFilterSyntaxError({ errorDetails: 'number of tokens in filter element is not equal 3' });
      }

      const fieldName = tokens[this.fieldNameIndex];

      const filterSymbol = tokens[this.operationNameIndex] as FilterSymbol;

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
          const tokenValues = tokens[this.valuesIndex];

          if (!tokenValues) {
            throw new InvalidFilterSyntaxError({ errorDetails: 'values not defined' });
          }

          const splitValues = tokenValues.split(this.valuesSeparator);

          const equalFilter: Filter = { filterName: FilterName.equal, filterSymbol, fieldName, values: splitValues };

          filters.push(equalFilter);

          break;
        }
        case FilterSymbol.lessThan: {
          const tokenValues = tokens[this.valuesIndex];

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
          const tokenValues = tokens[this.valuesIndex];

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
          const tokenValues = tokens[this.valuesIndex];

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
          const tokenValues = tokens[this.valuesIndex];

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
          const value = tokens[this.valuesIndex];

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
