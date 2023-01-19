import { IsDate, IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';
import { UserRole } from '../types';

export class UserDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsOptional()
  @IsString()
  public readonly email: string;

  @IsOptional()
  @IsString()
  public readonly phoneNumber: string;

  @IsString()
  public readonly password: string;

  @IsEnum(UserRole)
  public readonly role: UserRole;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UserDto);
}
