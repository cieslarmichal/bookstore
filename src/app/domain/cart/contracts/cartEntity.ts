/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';

import { CartStatus } from './cartStatus';
import { DeliveryMethod } from './deliveryMethod';
import { CustomerEntity } from '../../customer/contracts/customerEntity';

export const cartsTableName = 'carts';

@Entity({
  name: cartsTableName,
})
export class CartEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'enum', enum: CartStatus })
  //@ts-ignore
  public status: CartStatus;

  @Column({ type: 'float' })
  //@ts-ignore
  public totalPrice: number;

  @Column({ type: 'text', nullable: true })
  public billingAddressId?: string | null;

  @Column({ type: 'text', nullable: true })
  public shippingAddressId?: string | null;

  @Column({ type: 'enum', enum: DeliveryMethod, nullable: true })
  //@ts-ignore
  public deliveryMethod?: DeliveryMethod | null;

  @ManyToOne(() => CustomerEntity, (customer) => customer.carts, { onDelete: 'CASCADE' })
  public customer?: CustomerEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public customerId: string;

  // @OneToMany(() => LineItemEntity, (lineItem) => lineItem.cart)
  // public lineItems?: LineItemEntity[];
}
