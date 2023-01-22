import { IsOptional, IsString } from '../../../../../common/validator/decorators';
import { Validator } from '../../../../../common/validator/validator';

export class CreateAuthorData {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsOptional()
  @IsString()
  public about?: string;

  public constructor({ firstName, lastName, about }: CreateAuthorData) {
    this.firstName = firstName;
    this.lastName = lastName;

    if (about) {
      this.about = about;
    }

    Validator.validate(this);
  }
}
