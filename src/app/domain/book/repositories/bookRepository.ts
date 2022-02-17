import { EntityManager, EntityRepository } from 'typeorm';

@EntityRepository()
export class BookRepository {
  public constructor(private readonly manager: EntityManager) {}
}
