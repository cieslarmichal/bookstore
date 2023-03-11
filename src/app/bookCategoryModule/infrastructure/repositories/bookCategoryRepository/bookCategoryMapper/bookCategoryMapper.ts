import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { BookCategory } from '../../../../domain/entities/bookCategory/bookCategory';
import { BookCategoryEntity } from '../bookCategoryEntity/bookCategoryEntity';

export type BookCategoryMapper = Mapper<BookCategoryEntity, BookCategory>;
