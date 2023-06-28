import { CreateBookCategoryResponseCreatedBody } from '../../../application/modules/bookCategoryModule/api/httpControllers/bookCategoryHttpController/schemas/createBookCategorySchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class BookCategoryService {
  public constructor(private readonly httpService: HttpService) {}

  public async createBookCategory(
    bookId: string,
    categoryId: string,
    accessToken: string,
  ): Promise<CreateBookCategoryResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateBookCategoryResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: `/books/${bookId}/categories/${categoryId}`,
      headers: { [HttpHeader.authorization]: `Bearer ${accessToken}` },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
