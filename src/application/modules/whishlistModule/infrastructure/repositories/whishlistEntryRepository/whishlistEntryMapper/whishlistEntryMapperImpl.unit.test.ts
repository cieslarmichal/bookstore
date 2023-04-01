import 'reflect-metadata';

import { WhishlistEntryMapperImpl } from './whishlistEntryMapperImpl';
import { WhishlistEntryEntityTestFactory } from '../../../../tests/factories/whishlistEntryEntityTestFactory/whishlistEntryEntityTestFactory';

describe('WhishlistEntryMapperImpl', () => {
  let whishlistEntryMapperImpl: WhishlistEntryMapperImpl;

  const whishlistEntryEntityTestFactory = new WhishlistEntryEntityTestFactory();

  beforeAll(async () => {
    whishlistEntryMapperImpl = new WhishlistEntryMapperImpl();
  });

  it('maps a whishlist entry entity to a whishlist entry', async () => {
    expect.assertions(1);

    const whishlistEntryEntity = whishlistEntryEntityTestFactory.create();

    const whishlistEntry = whishlistEntryMapperImpl.map(whishlistEntryEntity);

    expect(whishlistEntry).toEqual({
      id: whishlistEntryEntity.id,
      bookId: whishlistEntryEntity.bookId,
      customerId: whishlistEntryEntity.customerId,
    });
  });
});
