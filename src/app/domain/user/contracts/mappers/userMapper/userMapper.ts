import { Mapper } from '../../../../../common/mapper/mapper';
import { User } from '../../user';
import { UserEntity } from '../../userEntity';

export type UserMapper = Mapper<UserEntity, User>;
