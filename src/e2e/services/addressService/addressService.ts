import {
  CreateAddressBody,
  CreateAddressResponseCreatedBody,
} from '../../../application/modules/addressModule/api/httpControllers/addressHttpController/schemas/createAddressSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMediaType } from '../../../common/http/httpMediaType';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class AddressService {
  public constructor(private readonly httpService: HttpService) {}

  public async createAddress(
    createAddressBody: CreateAddressBody,
    accessToken: string,
  ): Promise<CreateAddressResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateAddressResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/addresses',
      body: createAddressBody,
      headers: {
        [HttpHeader.authorization]: `Bearer ${accessToken}`,
        [HttpHeader.contentType]: HttpMediaType.applicationJson,
      },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
