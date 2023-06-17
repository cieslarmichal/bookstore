import {
  CreateCustomerBody,
  CreateCustomerResponseCreatedBody,
} from '../../../application/modules/customerModule/api/httpControllers/customerHttpController/schemas/createCustomerSchema';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class CustomerService {
  public constructor(private readonly httpService: HttpService) {}

  public async createCustomer(createCustomerBody: CreateCustomerBody): Promise<CreateCustomerResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateCustomerResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: 'customers',
      body: createCustomerBody,
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
