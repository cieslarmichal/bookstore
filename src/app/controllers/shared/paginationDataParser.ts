import { IsNumber, IsOptional } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../app/shared';
import { PaginationData } from './types/paginationData';

class PaginationDataTemplate {
  @IsOptional()
  @IsNumber()
  public readonly limit?: number;

  @IsOptional()
  @IsNumber()
  public readonly offset?: number;
}

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;
const DEFAULT_OFFSET = 0;

export class PaginationDataParser {
  public static parse(data: Record<string, any>): PaginationData {
    const paginationDataTemplete = RecordToInstanceTransformer.transform(data, PaginationDataTemplate);

    const paginationData = PaginationData.create({
      limit: paginationDataTemplete.limit || DEFAULT_LIMIT,
      offset: paginationDataTemplete.offset || DEFAULT_OFFSET,
    });

    this.trim(paginationData);

    return paginationData;
  }

  private static trim(paginationData: PaginationData) {
    if (paginationData.limit > MAX_LIMIT) {
      paginationData.limit = MAX_LIMIT;
    }
  }
}
