/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne } from 'typeorm';

import { IsDate, IsOptional, IsString, IsUuidV4 } from '../../../common/validator/decorators';
import { CustomerEntity } from '../../customer/contracts/customerEntity';

export const addressesTableName = 'addresses';

@Entity({
  name: addressesTableName,
})
export class AddressEntity {
  @IsOptional()
  @IsUuidV4()
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @IsOptional()
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @IsOptional()
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @IsString()
  @Column()
  //@ts-ignore
  public firstName: string;

  @IsString()
  @Column()
  //@ts-ignore
  public lastName: string;

  @IsString()
  @Column()
  //@ts-ignore
  public phoneNumber: string;

  @IsString()
  @Column()
  //@ts-ignore
  public country: string;

  @IsString()
  @Column()
  //@ts-ignore
  public state: string;

  @IsString()
  @Column()
  //@ts-ignore
  public city: string;

  @IsString()
  @Column()
  //@ts-ignore
  public zipCode: string;

  @IsString()
  @Column()
  //@ts-ignore
  public streetAddress: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public deliveryInstructions?: string | undefined;

  @IsOptional()
  @ManyToOne(() => CustomerEntity, (customer) => customer.addresses, { onDelete: 'CASCADE' })
  public customer?: CustomerEntity | null;

  @IsOptional()
  @IsUuidV4()
  @Column({ type: 'uuid' })
  public customerId?: string;
}
