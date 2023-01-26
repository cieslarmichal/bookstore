/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne } from 'typeorm';

import { CustomerEntity } from '../../customer/contracts/customerEntity';

export const addressesTableName = 'addresses';

@Entity({
  name: addressesTableName,
})
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

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
  public deliveryInstructions?: string | undefined;

  @ManyToOne(() => CustomerEntity, (customer) => customer.addresses, { onDelete: 'CASCADE' })
  public customer?: CustomerEntity | null;

  @Column({ type: 'uuid' })
  public customerId?: string;
}
