/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, OneToMany, OneToOne, JoinColumn, Column, PrimaryColumn } from 'typeorm';

import { AddressEntity } from '../../address/contracts/addressEntity';
import { CartEntity } from '../../cart/contracts/cartEntity';
import { UserEntity } from '../../userModule/infrastructure/repositories/userRepository/userEntity/userEntity';

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

  @OneToMany(() => CartEntity, (cart) => cart.customer)
  public carts?: CartEntity[];

  @OneToOne(() => UserEntity, (user) => user.customer, { onDelete: 'CASCADE' })
  @JoinColumn()
  //@ts-ignore
  public user?: UserEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public userId: string;
}
