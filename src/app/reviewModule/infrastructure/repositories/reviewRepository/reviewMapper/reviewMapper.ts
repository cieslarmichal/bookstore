import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { Review } from '../../../../domain/entities/review/review';
import { ReviewEntity } from '../reviewEntity/reviewEntity';

export type ReviewMapper = Mapper<ReviewEntity, Review>;
