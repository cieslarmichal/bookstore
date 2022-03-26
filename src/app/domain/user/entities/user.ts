import { IsOptional, IsDate, IsString, IsEnum, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToOne } from 'typeorm';
import { Customer } from '../../customer/entities/customer';
import { UserRole } from '../types';

export const USER_TABLE_NAME = 'users';

@Entity({
  name: USER_TABLE_NAME,
})
export class User {
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

  @IsString()
  @Column({ type: 'text', unique: true })
  public email: string;

  @IsString()
  @Column()
  public password: string;

  @IsEnum(UserRole)
  @Column({ default: UserRole.user })
  public role: UserRole;

  @IsOptional()
  @OneToOne(() => Customer, (customer) => customer.user)
  public customer?: Customer | null;
}
