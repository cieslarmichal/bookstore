import { RecordToInstanceTransformer } from '../../../common/transformer/recordToInstanceTransformer';
import { PaginationData } from './paginationData';
import { PaginationDataTemplate } from './paginationDataTemplate';

export class PaginationDataParser {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 5;
  private readonly maxLimit = 20;

  public parse(data: Record<string, any>): PaginationData {
    const paginationDataTemplete = RecordToInstanceTransformer.transform(data, PaginationDataTemplate);

    const paginationData = PaginationData.create({
      page: paginationDataTemplete.page || this.defaultPage,
      limit: paginationDataTemplete.limit || this.defaultLimit,
    });

    this.trim(paginationData);

    return paginationData;
  }

  private trim(paginationData: PaginationData) {
    if (paginationData.page < this.defaultPage) {
      paginationData.page = this.defaultPage;
    }

    if (paginationData.limit > this.maxLimit) {
      paginationData.limit = this.maxLimit;
    }
  }
}
