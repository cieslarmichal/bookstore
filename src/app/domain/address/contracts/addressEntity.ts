/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

import { CustomerEntity } from '../../customer/contracts/customerEntity';

export const addressesTableName = 'addresses';

@Entity({
  name: addressesTableName,
})
export class AddressEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public firstName: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public lastName: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public phoneNumber: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public country: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public state: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public city: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public zipCode: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public streetAddress: string;

  @Column({ type: 'text', nullable: true })
  public deliveryInstructions?: string | null;

  @ManyToOne(() => CustomerEntity, (customer) => customer.addresses, { onDelete: 'CASCADE' })
  public customer?: CustomerEntity;

  @Column({ type: 'uuid' })
  public customerId?: string;
}
