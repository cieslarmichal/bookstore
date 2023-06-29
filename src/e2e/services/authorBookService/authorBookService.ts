import { CreateAuthorBookResponseCreatedBody } from '../../../application/modules/authorBookModule/api/httpControllers/authorBookHttpController/schemas/createAuthorBookSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class AuthorBookService {
  public constructor(private readonly httpService: HttpService) {}

  public async createAuthorBook(
    authorId: string,
    bookId: string,
    accessToken: string,
  ): Promise<CreateAuthorBookResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateAuthorBookResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: `/authors/${authorId}/books/${bookId}`,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error(JSON.stringify(response.body));
    }

    return response.body;
  }
}
