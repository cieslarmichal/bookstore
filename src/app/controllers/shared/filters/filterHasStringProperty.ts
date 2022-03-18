import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { FilterProperty } from './filterProperty';

@ValidatorConstraint()
export class FilterHasStringProperty implements ValidatorConstraintInterface {
  public validate(filterProperty: FilterProperty<string>, args: ValidationArguments) {
    const entries = Object.entries(filterProperty);
    return entries.length === 1 && typeof entries[0][1] === 'string';
  }

  public defaultMessage(args: ValidationArguments) {
    return 'Filter property value is not a string';
  }
}
