import { EQUAL_FILTER_NAME } from '../../../shared';
import { AddressDto } from './addressDto';

export const supportedFindAddressesFieldsFilters: Map<string, Array<string>> = new Map(
  Object.entries({
    customerId: [EQUAL_FILTER_NAME],
  }),
);

export class FindAddressesResponseData {
  public constructor(public readonly addresses: AddressDto[]) {}
}

export class FindAddressesResponseDto {
  public constructor(public readonly data: FindAddressesResponseData, public readonly statusCode: number) {}
}
