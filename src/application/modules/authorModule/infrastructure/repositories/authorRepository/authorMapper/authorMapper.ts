import { Mapper } from '../../../../../../../common/types/mapper';
import { Author } from '../../../../domain/entities/author/author';
import { AuthorEntity } from '../authorEntity/authorEntity';

export type AuthorMapper = Mapper<AuthorEntity, Author>;
