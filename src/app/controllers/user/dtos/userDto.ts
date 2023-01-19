import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';
import { UserRole } from '../../../domain/user/types';

export class UserDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  @IsOptional()
  public readonly email: string;

  @IsString()
  @IsOptional()
  public readonly phoneNumber: string;

  @IsEnum(UserRole)
  public readonly role: UserRole;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UserDto);
}
