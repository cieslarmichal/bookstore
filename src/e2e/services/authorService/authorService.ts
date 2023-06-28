import {
  CreateAuthorBody,
  CreateAuthorResponseCreatedBody,
} from '../../../application/modules/authorModule/api/httpControllers/authorHttpController/schemas/createAuthorSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class AuthorService {
  public constructor(private readonly httpService: HttpService) {}

  public async createAuthor(
    createAuthorBody: CreateAuthorBody,
    accessToken: string,
  ): Promise<CreateAuthorResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateAuthorResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/authors',
      body: createAuthorBody,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
