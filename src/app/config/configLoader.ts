import dotenv from 'dotenv';
import path from 'path';

export class ConfigLoader {
  public static loadConfig() {
    const envFileName = process.env.NODE_ENV === 'test' ? '.env.testing' : '.env';

    dotenv.config({ path: path.resolve(__dirname, `../../../${envFileName}`) });
  }
}
