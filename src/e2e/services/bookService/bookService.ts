import {
  CreateBookBody,
  CreateBookResponseCreatedBody,
} from '../../../application/modules/bookModule/api/httpControllers/bookHttpController/schemas/createBookSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMediaType } from '../../../common/http/httpMediaType';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class BookService {
  public constructor(private readonly httpService: HttpService) {}

  public async createBook(createBookBody: CreateBookBody, accessToken: string): Promise<CreateBookResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateBookResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/books',
      body: createBookBody,
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
