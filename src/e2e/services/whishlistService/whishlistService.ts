import {
  CreateWhishlistEntryBody,
  CreateWhishlistEntryResponseCreatedBody,
} from '../../../application/modules/whishlistModule/api/httpControllers/whishlistHttpController/schemas/createWhishlistEntrySchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMediaType } from '../../../common/http/httpMediaType';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class WhishlistService {
  public constructor(private readonly httpService: HttpService) {}

  public async createWhishlist(
    createWhishlistBody: CreateWhishlistEntryBody,
    accessToken: string,
  ): Promise<CreateWhishlistEntryResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateWhishlistEntryResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/whishlist-entries',
      body: createWhishlistBody,
      headers: {
        [HttpHeader.authorization]: `Bearer ${accessToken}`,
        [HttpHeader.contentType]: HttpMediaType.applicationJson,
      },
    });

    if (!response.isSuccess) {
      throw new Error(JSON.stringify(response.body));
    }

    return response.body;
  }
}
