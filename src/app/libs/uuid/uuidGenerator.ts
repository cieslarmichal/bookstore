import { v4 as uuidv4 } from 'uuid';

export class UuidGenerator {
  public static generateUuid(): string {
    return uuidv4();
  }
}
