import { isEnum, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { BookLanguage } from '../../../domain/book/types';
import { FilterProperty } from '../../shared/filters';

@ValidatorConstraint()
export class FilterHasBookLanguagePropertyConstraint implements ValidatorConstraintInterface {
  public validate(filterProperty: FilterProperty<BookLanguage>, args: ValidationArguments) {
    const entries = Object.entries(filterProperty);
    return entries.length === 1 && isEnum(entries[0][1], BookLanguage);
  }

  public defaultMessage(args: ValidationArguments) {
    return 'Filter property value is not valid book language';
  }
}
