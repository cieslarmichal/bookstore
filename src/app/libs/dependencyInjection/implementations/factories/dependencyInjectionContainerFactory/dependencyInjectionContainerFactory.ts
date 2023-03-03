import { Validator } from '../../../../../libs/validator/implementations/validator';
import {
  CreatePayload,
  createPayloadSchema,
} from '../../../contracts/factories/dependencyInjectionContainerFactory/createPayload';
import { DependencyInjectionContainer } from '../../dependencyInjectionContainer';

export class DependencyInjectionContainerFactory {
  public static async create(input: CreatePayload): Promise<DependencyInjectionContainer> {
    const { modules } = Validator.validate(createPayloadSchema, input);

    const container = new DependencyInjectionContainer();

    for (const module of modules) {
      await module.declareBindings(container);
    }

    return container;
  }
}
