import { IsOptional, IsDate, IsString, IsEnum, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column } from 'typeorm';
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
  @Column()
  public role: UserRole;
}
