import { AddressRepository } from '../repositories/addressRepository';
import { AddressService } from './addressService';
import { AddressTestDataGenerator } from '../testDataGenerators/addressTestDataGenerator';
import { ConfigLoader } from '../../../../configLoader';
import { createDIContainer } from '../../../shared';
import { DbModule } from '../../../shared';
import { AddressModule } from '../addressModule';
import { AddressNotFound } from '../errors';
import { PostgresHelper } from '../../../../integration/helpers/postgresHelper/postgresHelper';
import { LoggerModule } from '../../../shared/logger/loggerModule';
import { ADDRESS_REPOSITORY, ADDRESS_SERVICE } from '../addressInjectionSymbols';

describe('AddressService', () => {
  let addressService: AddressService;
  let addressRepository: AddressRepository;
  let addressTestDataGenerator: AddressTestDataGenerator;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDIContainer([DbModule, AddressModule, LoggerModule]);

    addressService = container.resolve(ADDRESS_SERVICE);
    addressRepository = container.resolve(ADDRESS_REPOSITORY);

    addressTestDataGenerator = new AddressTestDataGenerator();
  });

  afterEach(async () => {
    await PostgresHelper.removeDataFromTables();
  });

  describe('Create address', () => {
    it('creates address in database', async () => {
      expect.assertions(1);

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

      const createdAddressDto = await addressService.createAddress({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
      });

      const addressDto = await addressRepository.findOneById(createdAddressDto.id);

      expect(addressDto).not.toBeNull();
    });
  });

  describe('Find address', () => {
    it('finds address by id in database', async () => {
      expect.assertions(1);

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

      const address = await addressRepository.createOne({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
      });

      const foundAddress = await addressService.findAddress(address.id);

      expect(foundAddress).not.toBeNull();
    });

    it('should throw if address with given id does not exist in db', async () => {
      expect.assertions(1);

      const { id } = addressTestDataGenerator.generateData();

      try {
        await addressService.findAddress(id);
      } catch (error) {
        expect(error).toBeInstanceOf(AddressNotFound);
      }
    });
  });

  describe('Remove address', () => {
    it('removes address from database', async () => {
      expect.assertions(1);

      const { firstName, lastName, phoneNumber, country, state, city, zipCode, streetAddress } =
        addressTestDataGenerator.generateData();

      const address = await addressRepository.createOne({
        firstName,
        lastName,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        streetAddress,
      });

      await addressService.removeAddress(address.id);

      const addressDto = await addressRepository.findOneById(address.id);

      expect(addressDto).toBeNull();
    });

    it('should throw if address with given id does not exist', async () => {
      expect.assertions(1);

      const { id } = addressTestDataGenerator.generateData();

      try {
        await addressService.removeAddress(id);
      } catch (error) {
        expect(error).toBeInstanceOf(AddressNotFound);
      }
    });
  });
});
