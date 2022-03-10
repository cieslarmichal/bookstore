import { EntityManager, EntityRepository, FindConditions } from 'typeorm';
import { CategoryDto } from '../dtos';
import { Category } from '../entities/category';
import { CategoryMapper } from '../mappers/categoryMapper';
import { CategoryNotFound } from '../errors';

@EntityRepository()
export class CategoryRepository {
  public constructor(private readonly entityManager: EntityManager, private readonly categoryMapper: CategoryMapper) {}

  public async createOne(categoryData: Partial<Category>): Promise<CategoryDto> {
    // TODO: handle existing entities in all repos!!!!!
    const category = this.entityManager.create(Category, categoryData);

    const savedCategory = await this.entityManager.save(category);

    return this.categoryMapper.mapEntityToDto(savedCategory);
  }

  public async findOne(conditions: FindConditions<Category>): Promise<CategoryDto | null> {
    const category = await this.entityManager.findOne(Category, conditions);

    if (!category) {
      return null;
    }

    return this.categoryMapper.mapEntityToDto(category);
  }

  public async findOneById(id: string): Promise<CategoryDto | null> {
    return this.findOne({ id });
  }

  public async findMany(conditions: FindConditions<Category>): Promise<CategoryDto[]> {
    const categorys = await this.entityManager.find(Category, conditions);

    return categorys.map((category) => this.categoryMapper.mapEntityToDto(category));
  }

  public async updateOne(id: string, categoryData: Partial<Category>): Promise<CategoryDto> {
    const category = await this.findOneById(id);

    if (!category) {
      throw new CategoryNotFound({ id });
    }

    await this.entityManager.update(Category, { id }, categoryData);

    return this.findOneById(id) as Promise<CategoryDto>;
  }

  public async removeOne(id: string): Promise<void> {
    const category = await this.findOneById(id);

    if (!category) {
      throw new CategoryNotFound({ id });
    }

    await this.entityManager.delete(Category, { id });
  }
}
