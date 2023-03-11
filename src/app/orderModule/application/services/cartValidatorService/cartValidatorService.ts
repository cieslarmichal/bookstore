import { ValidatePayload } from './payloads/validatePayload';

export interface CartValidatorService {
  validate(input: ValidatePayload): Promise<void>;
}
