/* eslint-disable @typescript-eslint/ban-ts-comment */
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
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @OneToMany(() => AddressEntity, (address) => address.customer)
  public addresses?: AddressEntity[];

  @OneToOne(() => UserEntity, (user) => user.customer, { onDelete: 'CASCADE' })
  @JoinColumn()
  //@ts-ignore
  public user: UserEntity | null;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public userId: string;
}
