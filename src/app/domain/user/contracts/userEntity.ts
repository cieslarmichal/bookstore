import { IsOptional, IsDate, IsString, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToOne } from 'typeorm';
import { CustomerEntity } from '../../customer/contracts/customerEntity';
import { UserRole } from './userRole';

export const USER_TABLE_NAME = 'users';

@Entity({
  name: USER_TABLE_NAME,
})
export class UserEntity {
  @IsOptional()
  @IsUUID('4')
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsOptional()
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' })
  public createdAt: Date;

  @IsOptional()
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt: Date;

  @ValidateIf((object) => !object.phoneNumber || object.email)
  @IsString()
  @Column({ type: 'text', unique: true, nullable: true })
  public email: string;

  @ValidateIf((object) => !object.email || object.phoneNumber)
  @IsString()
  @Column({ type: 'text', unique: true, nullable: true })
  public phoneNumber: string;

  @IsString()
  @Column()
  public password: string;

  @IsEnum(UserRole)
  @Column({ default: UserRole.user })
  public role: UserRole;

  @IsOptional()
  @OneToOne(() => CustomerEntity, (customer) => customer.user)
  public customer?: CustomerEntity | null;
}
