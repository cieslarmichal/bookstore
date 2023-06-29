import {
  CreateReviewBody,
  CreateReviewResponseCreatedBody,
} from '../../../application/modules/reviewModule/api/httpControllers/reviewHttpController/schemas/createReviewSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMediaType } from '../../../common/http/httpMediaType';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class ReviewService {
  public constructor(private readonly httpService: HttpService) {}

  public async createReview(
    createReviewBody: CreateReviewBody,
    accessToken: string,
  ): Promise<CreateReviewResponseCreatedBody> {
    const response = await this.httpService.sendRequest<CreateReviewResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/reviews',
      body: createReviewBody,
      headers: {
        [HttpHeader.authorization]: `Bearer ${accessToken}`,
        [HttpHeader.contentType]: HttpMediaType.applicationJson,
      },
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body;
  }
}
