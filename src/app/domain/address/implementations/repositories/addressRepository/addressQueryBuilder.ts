import { EntityManager } from 'typeorm';

import { Filter } from '../../../../../common/types/contracts/filter';
import { QueryBuilder } from '../../../../../common/types/contracts/queryBuilder';
import { AddressEntity } from '../../../contracts/addressEntity';

export class AddressQueryBuilder extends QueryBuilder<AddressEntity> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, AddressEntity, 'address');
  }

  public where(filters: Filter[]): AddressQueryBuilder {
    for (const filter of filters) {
      this.partialConditionsForFilter(`address.${filter.fieldName}`, filter);
    }

    return this;
  }

  public skip(enitiesToSkip: number): AddressQueryBuilder {
    this.instance = this.instance.skip(enitiesToSkip);

    return this;
  }

  public take(enitiesToTake: number): AddressQueryBuilder {
    this.instance = this.instance.take(enitiesToTake);

    return this;
  }
}
