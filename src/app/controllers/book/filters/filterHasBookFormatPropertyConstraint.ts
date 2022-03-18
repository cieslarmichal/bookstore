import { isEnum, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { BookFormat } from '../../../domain/book/types';
import { FilterProperty } from '../../shared/filters';

@ValidatorConstraint()
export class FilterHasBookFormatPropertyConstraint implements ValidatorConstraintInterface {
  public validate(filterProperty: FilterProperty<BookFormat>, args: ValidationArguments) {
    const entries = Object.entries(filterProperty);
    return entries.length === 1 && isEnum(entries[0][1], BookFormat);
  }

  public defaultMessage(args: ValidationArguments) {
    return 'Filter property value is not valid book format';
  }
}
