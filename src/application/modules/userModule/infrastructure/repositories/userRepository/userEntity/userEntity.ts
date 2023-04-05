/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, OneToOne, PrimaryColumn } from 'typeorm';

import { CustomerEntity } from '../../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';

export const usersTableName = 'users';

@Entity({
  name: usersTableName,
})
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'text', unique: true, nullable: true })
  //@ts-ignore
  public email?: string | null;

  @Column({ type: 'text', unique: true, nullable: true })
  //@ts-ignore
  public phoneNumber?: string | null;

  @Column({ type: 'text' })
  //@ts-ignore
  public password: string;

  @OneToOne(() => CustomerEntity, (customer) => customer.user)
  public customer?: CustomerEntity;
}
