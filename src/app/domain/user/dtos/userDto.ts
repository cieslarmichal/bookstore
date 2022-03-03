import { IsDate, IsString, IsEnum, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';
import { UserRole } from '../types';

export class UserDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly email: string;

  @IsString()
  public readonly password: string;

  @IsEnum(UserRole)
  public readonly role: UserRole;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UserDto);
}
