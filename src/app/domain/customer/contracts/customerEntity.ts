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
import { AddressEntity } from '../../address/contracts/addressEntity';
import { UserEntity } from '../../user/contracts/userEntity';

export const CUSTOMER_TABLE_NAME = 'customers';

@Entity({
  name: CUSTOMER_TABLE_NAME,
})
export class CustomerEntity {
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
  @OneToMany(() => AddressEntity, (address) => address.customer)
  public addresses?: AddressEntity[];

  @IsOptional()
  @OneToOne(() => UserEntity, (user) => user.customer, { onDelete: 'CASCADE' })
  @JoinColumn()
  public user: UserEntity | null;

  @IsUUID('4')
  @Column({ type: 'uuid' })
  public userId: string;
}