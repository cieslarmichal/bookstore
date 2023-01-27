/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, OneToOne, PrimaryColumn } from 'typeorm';

import { UserRole } from './userRole';
import { CustomerEntity } from '../../customer/contracts/customerEntity';

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
  public email?: string;

  @Column({ type: 'text', unique: true, nullable: true })
  //@ts-ignore
  public phoneNumber?: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.user })
  //@ts-ignore
  public role: UserRole;

  @OneToOne(() => CustomerEntity, (customer) => customer.user)
  public customer?: CustomerEntity | null;
}
