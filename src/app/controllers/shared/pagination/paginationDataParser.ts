import { IsNumber, IsOptional } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';
import { PaginationData } from './paginationData';

class PaginationDataTemplate {
  @IsOptional()
  @IsNumber()
  public readonly page?: number;

  @IsOptional()
  @IsNumber()
  public readonly limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

export class PaginationDataParser {
  public static parse(data: Record<string, any>): PaginationData {
    const paginationDataTemplete = RecordToInstanceTransformer.transform(data, PaginationDataTemplate);

    const paginationData = PaginationData.create({
      page: paginationDataTemplete.page || DEFAULT_PAGE,
      limit: paginationDataTemplete.limit || DEFAULT_LIMIT,
    });

    this.trim(paginationData);

    return paginationData;
  }

  private static trim(paginationData: PaginationData) {
    if (paginationData.page < DEFAULT_PAGE) {
      paginationData.page = DEFAULT_PAGE;
    }

    if (paginationData.limit > MAX_LIMIT) {
      paginationData.limit = MAX_LIMIT;
    }
  }
}
