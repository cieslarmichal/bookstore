import {
  AddLineItemBody,
  AddLineItemResponseOkBody,
} from '../../../application/modules/orderModule/api/httpControllers/cartHttpController/schemas/addLineItemSchema';
import {
  CreateCartBody,
  CreateCartResponseCreatedBody,
} from '../../../application/modules/orderModule/api/httpControllers/cartHttpController/schemas/createCartSchema';
import {
  UpdateCartBody,
  UpdateCartResponseOkBody,
} from '../../../application/modules/orderModule/api/httpControllers/cartHttpController/schemas/updateCartSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class CartService {
  public constructor(private readonly httpService: HttpService) {}

  public async createCart(createCartBody: CreateCartBody, accessToken: string): Promise<CreateCartResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateCartResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/carts',
      body: createCartBody,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }

  public async updateCart(
    cartId: string,
    updateCartBody: UpdateCartBody,
    accessToken: string,
  ): Promise<UpdateCartResponseOkBody> {
    const response = await this.httpService.sendRequest<UpdateCartResponseOkBody>({
      method: HttpMethodName.post,
      endpoint: `/carts/${cartId}`,
      body: updateCartBody,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }

  public async addLineItem(
    cartId: string,
    addLineItemBody: AddLineItemBody,
    accessToken: string,
  ): Promise<AddLineItemResponseOkBody> {
    const response = await this.httpService.sendRequest<AddLineItemResponseOkBody>({
      endpoint: `/carts/${cartId}/add-line-item`,
      method: HttpMethodName.post,
      body: addLineItemBody,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
