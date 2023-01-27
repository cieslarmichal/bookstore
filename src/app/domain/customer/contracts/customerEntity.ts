/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, OneToMany, OneToOne, JoinColumn, Column, PrimaryColumn } from 'typeorm';

import { AddressEntity } from '../../address/contracts/addressEntity';
import { UserEntity } from '../../user/contracts/userEntity';

export const customersTableName = 'customers';

@Entity({
  name: customersTableName,
})
export class CustomerEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @OneToMany(() => AddressEntity, (address) => address.customer)
  public addresses?: AddressEntity[];

  @OneToOne(() => UserEntity, (user) => user.customer, { onDelete: 'CASCADE' })
  @JoinColumn()
  //@ts-ignore
  public user?: UserEntity | null;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public userId: string;
}
