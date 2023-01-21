/* eslint-disable @typescript-eslint/naming-convention */
import * as validator from 'class-validator';

export const IsOptional = validator.IsOptional;
export const IsInstanceOf = validator.IsInstance;
export const IsObject = validator.IsObject;
export const IsEnum = validator.IsEnum;
export const IsBoolean = validator.IsBoolean;
export const IsString = validator.IsString;
export const IsNumber = validator.IsNumber;
export const IsUuidV4 = (): PropertyDecorator => validator.IsUUID('4');
export const IsArray = validator.IsArray;
export const IsEmail = validator.IsEmail;
export const IsInteger = validator.IsInt;
export const IsPositiveNumber = validator.IsPositive;
export const IsNegativeNumber = validator.IsNegative;
export const MaxNumber = validator.Max;
export const MinNumber = validator.Min;
