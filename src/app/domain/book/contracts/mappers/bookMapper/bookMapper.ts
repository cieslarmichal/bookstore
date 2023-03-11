import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { Book } from '../../book';
import { BookEntity } from '../../bookEntity';

export type BookMapper = Mapper<BookEntity, Book>;
