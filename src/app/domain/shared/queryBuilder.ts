import {
  BetweenFilter,
  EqualFilter,
  Filter,
  GreaterThanFilter,
  GreaterThanOrEqualFilter,
  LessThanFilter,
  LessThanOrEqualFilter,
  LikeFilter,
} from '../../shared';
import { EntityManager, SelectQueryBuilder } from 'typeorm';

export abstract class QueryBuilder<T> {
  protected instance: SelectQueryBuilder<T>;
  private whereApplied: boolean;

  public constructor(
    private readonly entityManager: EntityManager,
    EntityConstructor: new () => T,
    queryBuilderAlias: string,
  ) {
    this.instance = this.entityManager.getRepository(EntityConstructor).createQueryBuilder(queryBuilderAlias);
  }

  public async getMany(): Promise<T[]> {
    return this.instance.getMany();
  }

  protected equalConditionForProperty(columnName: string, data: string) {
    if (!this.whereApplied) {
      this.equalConditionForPropertyAsFirstWhereCondition(columnName, data);
      this.whereApplied = true;
    } else {
      this.equalConditionForPropertyAsNextWhereCondition(columnName, data);
    }
  }

  private equalConditionForPropertyAsFirstWhereCondition(columnName: string, data: string) {
    const paramName = `${columnName}EqualsParameter`;
    this.instance.where(`${columnName} = :${paramName}`, {
      [`${paramName}`]: data,
    });
  }

  private equalConditionForPropertyAsNextWhereCondition(columnName: string, data: string) {
    const paramName = `${columnName}EqualsParameter`;
    this.instance.where(`${columnName} = :${paramName}`, {
      [`${paramName}`]: data,
    });
  }

  protected partialConditionsForFilter(columnName: string, filter: Filter) {
    if (!this.whereApplied) {
      this.partialConditionsForFilterPropertyAsFirstWhereCondition(columnName, filter);
      this.whereApplied = true;
    } else {
      this.partialConditionsForFilterPropertyAsNextWhereCondition(columnName, filter);
    }
  }

  private partialConditionsForFilterPropertyAsFirstWhereCondition(columnName: string, filter: Filter) {
    if (filter instanceof EqualFilter) {
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
    } else if (filter instanceof GreaterThanFilter) {
      const paramName = `${columnName}GreaterThanParameter`;
      this.instance.where(`${columnName} > :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof GreaterThanOrEqualFilter) {
      const paramName = `${columnName}GreaterThanOrEqualParameter`;
      this.instance.where(`${columnName} >= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof LessThanFilter) {
      const paramName = `${columnName}LessThanParameter`;
      this.instance.where(`${columnName} < :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof LessThanOrEqualFilter) {
      const paramName = `${columnName}LessThanOrEqualParameter`;
      this.instance.where(`${columnName} <= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof LikeFilter) {
      const paramName = `${columnName}LikeParameter`;
      this.instance.where(`${columnName} LIKE :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof BetweenFilter) {
      const paramName1 = `${columnName}BetweenParameter1`;
      const paramName2 = `${columnName}BetweenParameter2`;
      this.instance.where(`${columnName} BETWEEN :${paramName1} AND :${paramName2}`, {
        [`${paramName1}`]: filter.values[0],
        [`${paramName2}`]: filter.values[1],
      });
    }
  }

  private partialConditionsForFilterPropertyAsNextWhereCondition(columnName: string, filter: Filter) {
    if (filter instanceof EqualFilter) {
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
    } else if (filter instanceof GreaterThanFilter) {
      const paramName = `${columnName}GreaterThanParameter`;
      this.instance.where(`${columnName} > :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof GreaterThanOrEqualFilter) {
      const paramName = `${columnName}GreaterThanOrEqualParameter`;
      this.instance.where(`${columnName} >= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof LessThanFilter) {
      const paramName = `${columnName}LessThanParameter`;
      this.instance.where(`${columnName} < :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof LessThanOrEqualFilter) {
      const paramName = `${columnName}LessThanOrEqualParameter`;
      this.instance.where(`${columnName} <= :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof LikeFilter) {
      const paramName = `${columnName}LikeParameter`;
      this.instance.where(`${columnName} LIKE :${paramName}`, {
        [`${paramName}`]: filter.value,
      });
    } else if (filter instanceof BetweenFilter) {
      const paramName1 = `${columnName}BetweenParameter1`;
      const paramName2 = `${columnName}BetweenParameter2`;
      this.instance.where(`${columnName} BETWEEN :${paramName1} AND :${paramName2}`, {
        [`${paramName1}`]: filter.values[0],
        [`${paramName2}`]: filter.values[1],
      });
    }
  }
}
