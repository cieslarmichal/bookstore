import {
  CreateCategoryBody,
  CreateCategoryResponseCreatedBody,
} from '../../../application/modules/categoryModule/api/httpControllers/categoryHttpController/schemas/createCategorySchema';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class CategoryService {
  public constructor(private readonly httpService: HttpService) {}

  public async createCategory(createCategoryBody: CreateCategoryBody): Promise<CreateCategoryResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateCategoryResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: 'categories',
      body: createCategoryBody,
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
