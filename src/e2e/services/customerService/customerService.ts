import {
  CreateCustomerBody,
  CreateCustomerResponseCreatedBody,
} from '../../../application/modules/customerModule/api/httpControllers/customerHttpController/schemas/createCustomerSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class CustomerService {
  public constructor(private readonly httpService: HttpService) {}

  public async createCustomer(
    createCustomerBody: CreateCustomerBody,
    accessToken: string,
  ): Promise<CreateCustomerResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateCustomerResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/customers',
      body: createCustomerBody,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
