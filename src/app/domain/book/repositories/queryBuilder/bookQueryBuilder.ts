import { FilterProperty } from '../../../shared/types/filterProperty';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { Book } from '../../entities/book';
import { FindBooksData } from '../types';

export class BookQueryBuilder {
  private instance: SelectQueryBuilder<Book>;
  private whereApplied: boolean;

  public constructor(private readonly entityManager: EntityManager) {
    this.instance = this.entityManager.getRepository(Book).createQueryBuilder('book');
  }

  public conditions(findBooksData: FindBooksData): BookQueryBuilder {
    if (findBooksData.title) {
      this.partialConditionsForFilterProperty('book_title', findBooksData.title);
    }

    if (findBooksData.releaseYear) {
      this.partialConditionsForFilterProperty('book_releaseYear', findBooksData.releaseYear);
    }

    if (findBooksData.language) {
      this.partialConditionsForFilterProperty('book_language', findBooksData.language);
    }

    if (findBooksData.format) {
      this.partialConditionsForFilterProperty('book_format', findBooksData.format);
    }

    if (findBooksData.price) {
      this.partialConditionsForFilterProperty('book_price', findBooksData.price);
    }

    return this;
  }

  public skip(enitiesToSkip: number): BookQueryBuilder {
    this.instance = this.instance.skip(enitiesToSkip);
    return this;
  }

  public take(enitiesToTake: number): BookQueryBuilder {
    this.instance = this.instance.take(enitiesToTake);
    return this;
  }

  public async getMany(): Promise<Book[]> {
    return this.instance.getMany();
  }

  public getSql(): string {
    return this.instance.getSql();
  }

  private partialConditionsForFilterProperty(columnName: string, filterProperty: FilterProperty) {
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
