import { UpdateOneDraft } from './updateOneDraft';

export interface UpdateOnePayload {
  readonly id: string;
  readonly draft: UpdateOneDraft;
}
