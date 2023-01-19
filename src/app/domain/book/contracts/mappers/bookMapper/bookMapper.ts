import { Mapper } from '../../../../../common/mapper/mapper';
import { Book } from '../../book';
import { BookDto } from '../../bookDto';

export type BookMapper = Mapper<Book, BookDto>;
