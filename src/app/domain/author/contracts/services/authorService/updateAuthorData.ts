import { IsOptional, IsString } from '../../../../../common/validator/decorators';
import { Validator } from '../../../../../common/validator/validator';

export class UpdateAuthorData {
  @IsOptional()
  @IsString()
  public about?: string | undefined;

  public constructor({ about }: UpdateAuthorData) {
    if (about) {
      this.about = about;
    }

    Validator.validate(this);
  }
}
