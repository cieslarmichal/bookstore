import { IsDate, IsEnum, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';
import { UserRole } from '../../../domain/user/types';

export class UserDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly email: string;

  @IsEnum(UserRole)
  public readonly role: UserRole;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UserDto);
}
