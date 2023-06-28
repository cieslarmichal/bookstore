import {
  LoginUserBody,
  LoginUserResponseOkBody,
} from '../../../application/modules/userModule/api/httpControllers/userHttpController/schemas/loginUserSchema';
import { HttpMethodName } from '../../../common/http/httpMethodName';
import { HttpService } from '../../../libs/http/services/httpService/httpService';

export class AuthService {
  public constructor(private readonly httpService: HttpService) {}

  public async getUserToken(loginUserBody: LoginUserBody): Promise<string> {
    const response = await this.httpService.sendRequest<LoginUserResponseOkBody>({
      method: HttpMethodName.post,
      endpoint: '/users/login',
      body: loginUserBody,
    });

    if (!response.isSuccess) {
      throw new Error();
    }

    return response.body.token;
  }
}
