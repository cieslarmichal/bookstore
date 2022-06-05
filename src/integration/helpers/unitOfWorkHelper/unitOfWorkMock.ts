import { AwilixContainer } from 'awilix';
import { UNIT_OF_WORK_FACTORY } from '../../../app/shared';

export class UnitOfWorkMock {
  public constructor(private readonly container: AwilixContainer) {}

  public async mock() {
    const unitOfWorkFactory = this.container.resolve(UNIT_OF_WORK_FACTORY);

    const unitOfWork = await unitOfWorkFactory.create();

    jest.spyOn(unitOfWorkFactory, 'create').mockImplementation(async () => {
      return unitOfWork;
    });

    jest.spyOn(unitOfWork, 'commit').mockImplementation(async () => {
      await unitOfWork.rollback();
    });
  }
}
