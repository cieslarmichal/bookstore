import dotenv from 'dotenv';
import path from 'path';

export class ConfigLoader {
  public static loadConfig() {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  }
}
