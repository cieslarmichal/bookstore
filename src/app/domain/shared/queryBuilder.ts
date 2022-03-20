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
      this.instance.where(`${columnName} = :data`, {
        data: filterProperty.eq,
      });
    } else if (filterProperty.gt) {
      this.instance.where(`${columnName} > :data`, {
        data: filterProperty.gt,
      });
    } else if (filterProperty.gte) {
      this.instance.where(`${columnName} >= :data`, {
        data: filterProperty.gte,
      });
    } else if (filterProperty.lt) {
      this.instance.where(`${columnName} < :data`, {
        data: filterProperty.lt,
      });
    } else if (filterProperty.lte) {
      this.instance.where(`${columnName} <= :data`, {
        data: filterProperty.lte,
      });
    } else if (filterProperty.like) {
      this.instance.where(`${columnName} LIKE :data`, {
        data: filterProperty.like,
      });
    }
  }

  private partialConditionsForFilterPropertyAsNextWhereCondition(columnName: string, filterProperty: FilterProperty) {
    if (filterProperty.eq) {
      this.instance.andWhere(`${columnName} = :data`, {
        data: filterProperty.eq,
      });
    } else if (filterProperty.gt) {
      this.instance.andWhere(`${columnName} > :data`, {
        data: filterProperty.gt,
      });
    } else if (filterProperty.gte) {
      this.instance.andWhere(`${columnName} >= :data`, {
        data: filterProperty.gte,
      });
    } else if (filterProperty.lt) {
      this.instance.andWhere(`${columnName} < :data`, {
        data: filterProperty.lt,
      });
    } else if (filterProperty.lte) {
      this.instance.andWhere(`${columnName} <= :data`, {
        data: filterProperty.lte,
      });
    } else if (filterProperty.like) {
      this.instance.andWhere(`${columnName} LIKE :data`, {
        data: filterProperty.like,
      });
    }
  }
}
