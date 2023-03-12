/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, OneToOne, JoinColumn, Column, PrimaryColumn } from 'typeorm';

import { OrderStatus } from '../../../../domain/entities/order/orderStatus';
import { PaymentMethod } from '../../../../domain/entities/order/paymentMethod';
import { CartEntity } from '../../cartRepository/cartEntity/cartEntity';

export const ordersTableName = 'orders';

@Entity({
  name: ordersTableName,
})
export class OrderEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @OneToOne(() => CartEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'cartId', referencedColumnName: 'id' })
  //@ts-ignore
  public cart?: CartEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public cartId: string;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public customerId: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public orderNumber: string;

  @Column({ type: 'enum', enum: OrderStatus })
  //@ts-ignore
  public status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  //@ts-ignore
  public paymentMethod: PaymentMethod;
}
