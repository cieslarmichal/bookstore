import { CustomerHttpController } from './api/httpControllers/customerHttpController/customerHttpController';
import { CreateCustomerCommandHandler } from './application/commandHandlers/createCustomerCommandHandler/createCustomerCommandHandler';
import { CreateCustomerCommandHandlerImpl } from './application/commandHandlers/createCustomerCommandHandler/createCustomerCommandHandlerImpl';
import { DeleteCustomerCommandHandler } from './application/commandHandlers/deleteCustomerCommandHandler/deleteCustomerCommandHandler';
import { DeleteCustomerCommandHandlerImpl } from './application/commandHandlers/deleteCustomerCommandHandler/deleteCustomerCommandHandlerImpl';
import { FindCustomerQueryHandler } from './application/queryHandlers/findCustomerQueryHandler/findCustomerQueryHandler';
import { FindCustomerQueryHandlerImpl } from './application/queryHandlers/findCustomerQueryHandler/findCustomerQueryHandlerImpl';
import { CustomerRepositoryFactory } from './application/repositories/customerRepository/customerRepositoryFactory';
import { CustomerMapper } from './infrastructure/repositories/customerRepository/customerMapper/customerMapper';
import { CustomerMapperImpl } from './infrastructure/repositories/customerRepository/customerMapper/customerMapperImpl';
import { CustomerRepositoryFactoryImpl } from './infrastructure/repositories/customerRepository/customerRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class CustomerModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<CustomerMapper>(symbols.customerMapper, CustomerMapperImpl);

    container.bindToConstructor<CustomerRepositoryFactory>(
      symbols.customerRepositoryFactory,
      CustomerRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateCustomerCommandHandler>(
      symbols.createCustomerCommandHandler,
      CreateCustomerCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteCustomerCommandHandler>(
      symbols.deleteCustomerCommandHandler,
      DeleteCustomerCommandHandlerImpl,
    );

    container.bindToConstructor<FindCustomerQueryHandler>(
      symbols.findCustomerQueryHandler,
      FindCustomerQueryHandlerImpl,
    );

    container.bindToConstructor<CustomerHttpController>(symbols.customerHttpController, CustomerHttpController);
  }
}
