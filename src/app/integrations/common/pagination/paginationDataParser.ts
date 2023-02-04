import { PaginationDataDraft } from './paginationDataDraft';
import { PaginationData } from '../../../common/pagination/paginationData';

export class PaginationDataParser {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 5;
  private readonly maxLimit = 20;

  public parse(data: Record<string, unknown>): PaginationData {
    const paginationDataDraft = data as PaginationDataDraft;

    let page = paginationDataDraft.page ?? this.defaultPage;

    if (page < this.defaultPage) {
      page = this.defaultPage;
    }

    let limit = paginationDataDraft.limit ?? this.defaultLimit;

    if (limit > this.maxLimit) {
      limit = this.maxLimit;
    }

    return { page, limit };
  }
}
