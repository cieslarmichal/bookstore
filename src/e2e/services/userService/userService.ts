import {
  RegisterUserBody,
  RegisterUserResponseCreatedBody,
} from '../../../application/modules/userModule/api/httpControllers/userHttpController/schemas/registerUserSchema';
import { HttpHeader } from '../../../common/http/httpHeader';
import { HttpMediaType } from '../../../common/http/httpMediaType';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class UserService {
  public constructor(private readonly httpService: HttpService) {}

  public async createUser(createUserBody: RegisterUserBody): Promise<RegisterUserResponseCreatedBody> {
    const response = await this.httpService.sendRequest<RegisterUserResponseCreatedBody>({
      method: HttpMethodName.post,
      endpoint: '/users/register',
      body: createUserBody,
      headers: {
        [HttpHeader.contentType]: HttpMediaType.applicationJson,
      },
    });

    if (!response.isSuccess) {
      throw new Error(JSON.stringify(response.body));
    }

    return response.body;
  }
}
