import { QueryBuilder } from '../../../shared/queryBuilder';
import { EntityManager } from 'typeorm';
import { Address } from '../../entities/address';
import { Filter } from '../../../../common';

export class AddressQueryBuilder extends QueryBuilder<Address> {
  public constructor(entityManager: EntityManager) {
    super(entityManager, Address, 'address');
  }

  public addressConditions(filters: Filter[]): AddressQueryBuilder {
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
