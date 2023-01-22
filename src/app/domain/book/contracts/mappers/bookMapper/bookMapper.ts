import { Mapper } from '../../../../../common/mapper/mapper';
import { Book } from '../../book';
import { BookEntity } from '../../bookEntity';

export type BookMapper = Mapper<BookEntity, Book>;
