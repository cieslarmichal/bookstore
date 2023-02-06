/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContainer, InjectionMode, AwilixContainer } from 'awilix';

import { PayloadFactory } from '../../../../../common/validator/implementations/payloadFactory';
import {
  CreatePayload,
  createPayloadSchema,
} from '../../../contracts/factories/dependencyInjectionContainerFactory/createPayload';

export class DependencyInjectionContainerFactory {
  public static async create(input: CreatePayload): Promise<AwilixContainer<any>> {
    const { modules } = PayloadFactory.create(createPayloadSchema, input);

    const container = createContainer({
      injectionMode: InjectionMode.CLASSIC,
    });

    for (const module of modules) {
      await module.registerSymbols(container);
    }

    return container;
  }
}
