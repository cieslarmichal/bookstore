import { Mapper } from '../../../../../../common/types/contracts/mapper';
import { User } from '../../user';
import { UserEntity } from '../../userEntity';

export type UserMapper = Mapper<UserEntity, User>;
