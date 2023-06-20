import {
  CreateInventoryBody,
  CreateInventoryResponseCreatedBody,
} from '../../../application/modules/inventoryModule/api/httpControllers/inventoryHttpController/schemas/createInventorySchema';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class InventoryService {
  public constructor(private readonly httpService: HttpService) {}

  public async createInventory(createInventoryBody: CreateInventoryBody): Promise<CreateInventoryResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateInventoryResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: 'inventories',
      body: createInventoryBody,
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
