/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany } from 'typeorm';

import { CustomerEntity } from '../../../../../domain/customer/contracts/customerEntity';
import { LineItemEntity } from '../../../../../domain/lineItem/contracts/lineItemEntity';
import { CartStatus } from '../../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../../domain/entities/cart/deliveryMethod';

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

  @ManyToOne(() => CustomerEntity, (customer) => customer.carts, { onDelete: 'CASCADE', eager: true })
  public customer?: CustomerEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public customerId: string;

  @OneToMany(() => LineItemEntity, (lineItem) => lineItem.cart, { eager: true })
  public lineItems?: LineItemEntity[];
}