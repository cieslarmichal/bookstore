import { Mapper } from '../../../../../../../common/types/mapper';
import { AuthorBook } from '../../../../domain/entities/authorBook/authorBook';
import { AuthorBookEntity } from '../authorBookEntity/authorBookEntity';

export type AuthorBookMapper = Mapper<AuthorBookEntity, AuthorBook>;
