import { CreateReviewPayload } from './createReviewPayload';
import { DeleteReviewPayload } from './deleteReviewPayload';
import { FindReviewPayload } from './findReviewPayload';
import { FindReviewsPayload } from './findReviewsPayload';
import { UpdateReviewPayload } from './updateReviewPayload';
import { Review } from '../../review';

export interface ReviewService {
  createReview(input: CreateReviewPayload): Promise<Review>;
  findReview(input: FindReviewPayload): Promise<Review>;
  findReviews(input: FindReviewsPayload): Promise<Review[]>;
  updateReview(input: UpdateReviewPayload): Promise<Review>;
  deleteReview(input: DeleteReviewPayload): Promise<void>;
}
