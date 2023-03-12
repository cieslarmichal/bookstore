import { HttpController, HttpMethodName, HttpRequest, HttpResponse, HttpRoute, HttpStatusCode } from '@common/http';
import { Inject, Injectable } from '@libs/dependency-injection';
import { UuidService, uuidSymbols } from '@libs/uuid';

import { CreateCustomerBodyPayload, createCustomerBodyPayloadSchema } from './payloads/createCustomerBodyPayload.js';

@Injectable()
export class CustomerHttpController implements HttpController {
  public readonly basePath = 'customers';

  public constructor(
    @Inject(uuidSymbols.uuidService)
    private readonly uuidService: UuidService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createCustomer.bind(this),
        requestSchema: { bodySchema: createCustomerBodyPayloadSchema },
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findCustomer.bind(this),
      }),
    ];
  }

  private async createCustomer(request: HttpRequest): Promise<HttpResponse> {
    const { name } = request.body as CreateCustomerBodyPayload;

    return { statusCode: HttpStatusCode.created, body: { user: { id: this.uuidService.v4(), name } } };
  }

  private async findCustomer(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.pathParams;

    return { statusCode: HttpStatusCode.ok, body: { user: { id, name: 'customer' } } };
  }
}
