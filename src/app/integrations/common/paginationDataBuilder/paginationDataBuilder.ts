import { BuildPayload, buildPayloadSchema } from './buildPayload';
import { PaginationData } from '../../../common/types/contracts/paginationData';
import { Injectable } from '../../../libs/dependencyInjection/contracts/decorators';
import { Validator } from '../../../libs/validator/implementations/validator';

@Injectable()
export class PaginationDataBuilder {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 5;
  private readonly maxLimit = 20;

  public build(input: BuildPayload): PaginationData {
    const payload = Validator.validate(buildPayloadSchema, input);

    let page = payload.page || this.defaultPage;

    if (page < this.defaultPage) {
      page = this.defaultPage;
    }

    let limit = payload.limit || this.defaultLimit;

    if (limit > this.maxLimit) {
      limit = this.maxLimit;
    }

    return { page, limit };
  }
}
