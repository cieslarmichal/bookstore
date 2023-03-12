import { BuildPayload, buildPayloadSchema } from './payloads/buildPayload';
import { Validator } from '../../libs/validator/implementations/validator';
import { PaginationData } from '../types/paginationData';

const defaultPage = 1;
const defaultLimit = 5;
const maxLimit = 20;

export class PaginationDataBuilder {
  public static build(input: BuildPayload): PaginationData {
    const payload = Validator.validate(buildPayloadSchema, input);

    let page = payload.page || defaultPage;

    if (page < defaultPage) {
      page = defaultPage;
    }

    let limit = payload.limit || defaultLimit;

    if (limit > maxLimit) {
      limit = maxLimit;
    }

    return { page, limit };
  }
}
