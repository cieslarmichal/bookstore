export abstract class Mapper<Entity, Dto> {
  public abstract mapEntityToDto(entity: Entity): Dto;
}
