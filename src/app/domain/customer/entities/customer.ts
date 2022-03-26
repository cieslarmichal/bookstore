import { IsOptional, IsDate, IsUUID } from 'class-validator';
import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Address } from '../../address/entities/address';
import { User } from '../../user/entities/user';

export const CUSTOMER_TABLE_NAME = 'customers';

@Entity({
  name: CUSTOMER_TABLE_NAME,
})
export class Customer {
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

  @IsOptional()
  @OneToMany(() => Address, (address) => address.customer)
  public addresses?: Address[];

  @IsOptional()
  @OneToOne(() => User, (user) => user.customer, { onDelete: 'CASCADE' })
  @JoinColumn()
  public user: User | null;

  @IsUUID('4')
  @Column({ type: 'uuid' })
  public userId: string;
}
