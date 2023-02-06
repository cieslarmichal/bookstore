import { UserRole } from './userRole';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const userInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  email: Schema.notEmptyString().optional(),
  phoneNumber: Schema.notEmptyString().optional(),
  password: Schema.notEmptyString(),
  role: Schema.enum(UserRole),
});

export type UserInput = SchemaType<typeof userInputSchema>;

export class User {
  public readonly id: string;
  public readonly email?: string;
  public readonly phoneNumber?: string;
  public readonly password: string;
  public readonly role: UserRole;

  public constructor(input: UserInput) {
    const { id, email, phoneNumber, password, role } = PayloadFactory.create(userInputSchema, input);

    this.id = id;
    this.password = password;
    this.role = role;

    if (email) {
      this.email = email;
    }

    if (phoneNumber) {
      this.phoneNumber = phoneNumber;
    }
  }
}
