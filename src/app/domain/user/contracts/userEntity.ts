/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IsOptional, IsDate, IsString, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToOne } from 'typeorm';

import { UserRole } from './userRole';
import { CustomerEntity } from '../../customer/contracts/customerEntity';

export const usersTableName = 'users';

@Entity({
  name: usersTableName,
})
export class UserEntity {
  @IsOptional()
  @IsUUID('4')
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @IsOptional()
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @IsOptional()
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @ValidateIf((object) => !object.phoneNumber || object.email)
  @IsString()
  @Column({ type: 'text', unique: true, nullable: true })
  //@ts-ignore
  public email?: string;

  @ValidateIf((object) => !object.email || object.phoneNumber)
  @IsString()
  @Column({ type: 'text', unique: true, nullable: true })
  //@ts-ignore
  public phoneNumber?: string;

  @IsString()
  @Column({ type: 'text' })
  //@ts-ignore
  public password: string;

  @IsEnum(UserRole)
  @Column({ type: 'enum', enum: [UserRole.admin, UserRole.user], default: UserRole.user })
  //@ts-ignore
  public role: UserRole;

  @IsOptional()
  @OneToOne(() => CustomerEntity, (customer) => customer.user)
  public customer?: CustomerEntity | null;
}
