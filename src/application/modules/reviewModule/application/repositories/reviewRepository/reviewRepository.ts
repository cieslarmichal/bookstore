import { CreateReviewPayload } from './payloads/createReviewPayload';
import { DeleteReviewPayload } from './payloads/deleteReviewPayload';
import { FindReviewPayload } from './payloads/findReviewPayload';
import { FindReviewsPayload } from './payloads/findReviewsPayload';
import { UpdateReviewPayload } from './payloads/updateReviewPayload';
import { Review } from '../../../domain/entities/review/review';

export interface ReviewRepository {
  createReview(input: CreateReviewPayload): Promise<Review>;
  findReview(input: FindReviewPayload): Promise<Review | null>;
  findReviews(input: FindReviewsPayload): Promise<Review[]>;
  updateReviews(input: UpdateReviewPayload): Promise<Review>;
  deleteReview(input: DeleteReviewPayload): Promise<void>;
}
