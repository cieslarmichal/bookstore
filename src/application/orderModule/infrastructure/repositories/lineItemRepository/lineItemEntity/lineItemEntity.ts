/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';

import { BookEntity } from '../../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CartEntity } from '../../cartRepository/cartEntity/cartEntity';

export const lineItemsTableName = 'lineItems';

@Entity({
  name: lineItemsTableName,
})
export class LineItemEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'int' })
  //@ts-ignore
  public quantity: number;

  @Column({ type: 'float' })
  //@ts-ignore
  public price: number;

  @Column({ type: 'float' })
  //@ts-ignore
  public totalPrice: number;

  @ManyToOne(() => BookEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId', referencedColumnName: 'id' })
  public book?: BookEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public bookId: string;

  @ManyToOne(() => CartEntity, (cart) => cart.lineItems, { onDelete: 'CASCADE' })
  public cart?: CartEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public cartId: string;
}
