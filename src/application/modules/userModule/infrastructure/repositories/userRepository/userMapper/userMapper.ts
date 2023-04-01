import { Mapper } from '../../../../../../../common/types/mapper';
import { User } from '../../../../domain/entities/user/user';
import { UserEntity } from '../userEntity/userEntity';

export type UserMapper = Mapper<UserEntity, User>;
