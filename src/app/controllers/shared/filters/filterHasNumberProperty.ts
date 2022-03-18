import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { FilterProperty } from './filterProperty';

@ValidatorConstraint()
export class FilterHasNumberProperty implements ValidatorConstraintInterface {
  public validate(filterProperty: FilterProperty<number>, args: ValidationArguments) {
    const entries = Object.entries(filterProperty);
    return entries.length === 1 && typeof entries[0][1] === 'number';
  }

  public defaultMessage(args: ValidationArguments) {
    return 'Filter property value is not a number';
  }
}
