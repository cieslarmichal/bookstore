import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { FilterProperty } from './types/filterProperty';

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

  protected partialConditionsForFilterProperty(columnName: string, filterProperty: FilterProperty) {
    if (!this.whereApplied) {
      this.partialConditionsForFilterPropertyAsFirstWhereCondition(columnName, filterProperty);
      this.whereApplied = true;
    } else {
      this.partialConditionsForFilterPropertyAsNextWhereCondition(columnName, filterProperty);
    }
  }

  private partialConditionsForFilterPropertyAsFirstWhereCondition(columnName: string, filterProperty: FilterProperty) {
    if (filterProperty.eq) {
      const paramName = `${columnName}EqualsParameter`;
      this.instance.where(`${columnName} = :${paramName}`, {
        [`${paramName}`]: filterProperty.eq,
      });
    } else if (filterProperty.gt) {
      const paramName = `${columnName}GreaterThanParameter`;
      this.instance.where(`${columnName} > :${paramName}`, {
        [`${paramName}`]: filterProperty.gt,
      });
    } else if (filterProperty.gte) {
      const paramName = `${columnName}GreaterThanOrEqualParameter`;
      this.instance.where(`${columnName} >= :${paramName}`, {
        [`${paramName}`]: filterProperty.gte,
      });
    } else if (filterProperty.lt) {
      const paramName = `${columnName}LessThanParameter`;
      this.instance.where(`${columnName} < :${paramName}`, {
        [`${paramName}`]: filterProperty.lt,
      });
    } else if (filterProperty.lte) {
      const paramName = `${columnName}LessThanOrEqualParameter`;
      this.instance.where(`${columnName} <= :${paramName}`, {
        [`${paramName}`]: filterProperty.lte,
      });
    } else if (filterProperty.like) {
      const paramName = `${columnName}LikeParameter`;
      this.instance.where(`${columnName} LIKE :${paramName}`, {
        [`${paramName}`]: filterProperty.like,
      });
    }
  }

  private partialConditionsForFilterPropertyAsNextWhereCondition(columnName: string, filterProperty: FilterProperty) {
    if (filterProperty.eq) {
      const paramName = `${columnName}EqualsParameter`;
      this.instance.andWhere(`${columnName} = :${paramName}`, {
        [`${paramName}`]: filterProperty.eq,
      });
    } else if (filterProperty.gt) {
      const paramName = `${columnName}GreaterThanParameter`;
      this.instance.andWhere(`${columnName} > :${paramName}`, {
        [`${paramName}`]: filterProperty.gt,
      });
    } else if (filterProperty.gte) {
      const paramName = `${columnName}GreaterThanOrEqualParameter`;
      this.instance.andWhere(`${columnName} >= :${paramName}`, {
        [`${paramName}`]: filterProperty.gte,
      });
    } else if (filterProperty.lt) {
      const paramName = `${columnName}LessThanParameter`;
      this.instance.andWhere(`${columnName} < :${paramName}`, {
        [`${paramName}`]: filterProperty.lt,
      });
    } else if (filterProperty.lte) {
      const paramName = `${columnName}LessThanOrEqualParameter`;
      this.instance.andWhere(`${columnName} <= :${paramName}`, {
        [`${paramName}`]: filterProperty.lte,
      });
    } else if (filterProperty.like) {
      const paramName = `${columnName}LikeParameter`;
      this.instance.andWhere(`${columnName} LIKE :${paramName}`, {
        [`${paramName}`]: filterProperty.like,
      });
    }
  }
}
