import { Mapper } from '../../../../../../common/types/mapper';
import { Book } from '../../../../domain/entities/book/book';
import { BookEntity } from '../bookEntity/bookEntity';

export type BookMapper = Mapper<BookEntity, Book>;
