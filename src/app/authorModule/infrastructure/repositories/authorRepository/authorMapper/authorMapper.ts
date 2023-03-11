import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { Author } from '../../../../domain/entities/author/author';
import { AuthorEntity } from '../authorEntity/authorEntity';

export type AuthorMapper = Mapper<AuthorEntity, Author>;
