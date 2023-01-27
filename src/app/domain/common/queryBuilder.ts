import { EntityManager, SelectQueryBuilder } from 'typeorm';

import { ObjectLiteral } from './objectLiteral';
import { Filter } from '../../common/filter/filter';
import { FilterName } from '../../common/filter/filterName';

export abstract class QueryBuilder<T extends ObjectLiteral> {
  protected instance: SelectQueryBuilder<T>;
  private whereApplied = false;

  public constructor(
    private readonly entityManager: EntityManager,
    entityConstructor: new () => T,
    queryBuilderAlias: string,
  ) {
    this.instance = this.entityManager.getRepository(entityConstructor).createQueryBuilder(queryBuilderAlias);
  }

  public async getMany(): Promise<T[]> {
    return this.instance.getMany();
  }

  protected equalConditionForProperty(columnName: string, data: string): void {
    if (!this.whereApplied) {
      this.equalConditionForPropertyAsFirstWhereCondition(columnName, data);
      this.whereApplied = true;
    } else {
      this.equalConditionForPropertyAsNextWhereCondition(columnName, data);
    }
  }

  private equalConditionForPropertyAsFirstWhereCondition(columnName: string, data: string): void {
    const paramName = `${columnName}EqualsParameter`;
    this.instance.where(`${columnName} = :${paramName}`, {
      [`${paramName}`]: data,
    });
  }

  private equalConditionForPropertyAsNextWhereCondition(columnName: string, data: string): void {
    const paramName = `${columnName}EqualsParameter`;
    this.instance.where(`${columnName} = :${paramName}`, {
      [`${paramName}`]: data,
    });
  }

  protected partialConditionsForFilter(columnName: string, filter: Filter): void {
    if (!this.whereApplied) {
      this.partialConditionsForFilterPropertyAsFirstWhereCondition(columnName, filter);
      this.whereApplied = true;
    } else {
      this.partialConditionsForFilterPropertyAsNextWhereCondition(columnName, filter);
    }
  }

  private partialConditionsForFilterPropertyAsFirstWhereCondition(columnName: string, filter: Filter): void {
    if (filter.filterName === FilterName.equal) {
      const paramName = `${columnName}EqualsParameter`;

      if (filter.values.length === 1) {
        this.instance.where(`${columnName} = :${paramName}`, {
          [`${paramName}`]: filter.values[0],
        });
      } else {
        this.instance.where(`${columnName} IN (:...${paramName})`, {
          [`${paramName}`]: filter.values,
        });
      }
    } else if (filter.filterName === FilterName.greaterThan) {
      const paramName = `${columnName}GreaterThanParameter`;
      this.instance.where(`${columnName} > :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.greaterThanOrEqual) {
      const paramName = `${columnName}GreaterThanOrEqualParameter`;
      this.instance.where(`${columnName} >= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.lessThan) {
      const paramName = `${columnName}LessThanParameter`;
      this.instance.where(`${columnName} < :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.lessThanOrEqual) {
      const paramName = `${columnName}LessThanOrEqualParameter`;
      this.instance.where(`${columnName} <= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.like) {
      const paramName = `${columnName}LikeParameter`;
      this.instance.where(`${columnName} LIKE :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.between) {
      const paramName1 = `${columnName}BetweenParameter1`;
      const paramName2 = `${columnName}BetweenParameter2`;
      this.instance.where(`${columnName} BETWEEN :${paramName1} AND :${paramName2}`, {
        [`${paramName1}`]: filter.from,
        [`${paramName2}`]: filter.to,
      });
    }
  }

  private partialConditionsForFilterPropertyAsNextWhereCondition(columnName: string, filter: Filter): void {
    if (filter.filterName === FilterName.equal) {
      const paramName = `${columnName}EqualsParameter`;

      if (filter.values.length === 1) {
        this.instance.where(`${columnName} = :${paramName}`, {
          [`${paramName}`]: filter.values[0],
        });
      } else {
        this.instance.where(`${columnName} IN (:...${paramName})`, {
          [`${paramName}`]: filter.values,
        });
      }
    } else if (filter.filterName === FilterName.greaterThan) {
      const paramName = `${columnName}GreaterThanParameter`;
      this.instance.where(`${columnName} > :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.greaterThanOrEqual) {
      const paramName = `${columnName}GreaterThanOrEqualParameter`;
      this.instance.where(`${columnName} >= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.lessThan) {
      const paramName = `${columnName}LessThanParameter`;
      this.instance.where(`${columnName} < :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.lessThanOrEqual) {
      const paramName = `${columnName}LessThanOrEqualParameter`;
      this.instance.where(`${columnName} <= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.like) {
      const paramName = `${columnName}LikeParameter`;
      this.instance.where(`${columnName} LIKE :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter.filterName === FilterName.between) {
      const paramName1 = `${columnName}BetweenParameter1`;
      const paramName2 = `${columnName}BetweenParameter2`;
      this.instance.where(`${columnName} BETWEEN :${paramName1} AND :${paramName2}`, {
        [`${paramName1}`]: filter.from,
        [`${paramName2}`]: filter.to,
      });
    }
  }
}
