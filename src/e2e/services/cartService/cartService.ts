import {
  CreateCartBody,
  CreateCartResponseCreatedBody,
} from '../../../application/modules/orderModule/api/httpControllers/cartHttpController/schemas/createCartSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class CartService {
  public constructor(private readonly httpService: HttpService) {}

  public async createCart(createCartBody: CreateCartBody, accessToken: string): Promise<CreateCartResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateCartResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: 'carts',
      body: createCartBody,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
