import { DependencyInjectionContainer } from './dependencyInjectionContainer';
import { CreatePayload, createPayloadSchema } from './payloads/createPayload';
import { Validator } from '../validator/implementations/validator';

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
