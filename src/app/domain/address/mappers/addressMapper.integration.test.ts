import { EntityManager } from 'typeorm';
import { Address } from '../entities/address';
import { AddressMapper } from './addressMapper';
import { AddressTestDataGenerator } from '../testDataGenerators/addressTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { AddressModule } from '../addressModule';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { ENTITY_MANAGER } from '../../../shared/db/dbInjectionSymbols';
import { ADDRESS_MAPPER } from '../addressInjectionSymbols';

describe('AddressMapper', () => {
  let addressMapper: AddressMapper;
  let addressTestDataGenerator: AddressTestDataGenerator;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, AddressModule, LoggerModule]);

    addressMapper = container.resolve(ADDRESS_MAPPER);
    entityManager = container.resolve(ENTITY_MANAGER);

    addressTestDataGenerator = new AddressTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Map address', () => {
    it('map address from entity to dto', async () => {
      expect.assertions(1);

      const { fullName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

      const createdAddress = entityManager.create(Address, {
        fullName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
      });

      const savedAddress = await entityManager.save(createdAddress);

      const addressDto = addressMapper.mapEntityToDto(savedAddress);

      expect(addressDto).toEqual({
        id: savedAddress.id,
        createdAt: savedAddress.createdAt,
        updatedAt: savedAddress.updatedAt,
        fullName: savedAddress.fullName,
        phoneNumber: savedAddress.phoneNumber,
        country: savedAddress.country,
        state: savedAddress.state,
        city: savedAddress.city,
        zipCode: savedAddress.zipCode,
        streetAddress: savedAddress.streetAddress,
      });
    });
  });
});
