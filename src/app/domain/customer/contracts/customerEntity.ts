/* eslint-disable @typescript-eslint/ban-ts-comment */
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

export const customersTableName = 'customers';

@Entity({
  name: customersTableName,
})
export class CustomerEntity {
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

  @IsOptional()
  @OneToMany(() => AddressEntity, (address) => address.customer)
  public addresses?: AddressEntity[];

  @IsOptional()
  @OneToOne(() => UserEntity, (user) => user.customer, { onDelete: 'CASCADE' })
  @JoinColumn()
  //@ts-ignore
  public user: UserEntity | null;

  @IsUUID('4')
  @Column({ type: 'uuid' })
  //@ts-ignore
  public userId: string;
}
