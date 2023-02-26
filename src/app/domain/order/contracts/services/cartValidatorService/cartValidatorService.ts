import { ValidatePayload } from './validatePayload';

export interface CartValidatorService {
  validate(input: ValidatePayload): Promise<void>;
}
