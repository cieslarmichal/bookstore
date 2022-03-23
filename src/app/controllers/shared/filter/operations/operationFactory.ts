import { BetweenOperation } from './betweenOperation';
import { EqualOperation } from './equalOperation';
import { GreaterThanOperation } from './greaterThanOperation';
import { GreaterThanOrEqualOperation } from './greaterThanOrEqualOperation';
import { LessThanOperation } from './lessThanOperation';
import { LessThanOrEqualOperation } from './lessThanOrEqualOperation';
import { LikeOperation } from './likeOperation';
import {
  BETWEEN_OPERATION_NAME,
  EQUAL_OPERATION_NAME,
  GREATER_THAN_OPERATION_NAME,
  GREATER_THAN_OR_EQUAL_OPERATION_NAME,
  LESS_THAN_OPERATION_NAME,
  LESS_THAN_OR_EQUAL_OPERATION_NAME,
  LIKE_OPERATION_NAME,
} from './operationNames';

export class OperationFactory {
  public static create(operationName: string, fieldName: string, data: any) {
    switch (operationName) {
      case EQUAL_OPERATION_NAME:
        return new EqualOperation(fieldName, data);
      case LESS_THAN_OPERATION_NAME:
        return new LessThanOperation(fieldName, data);
      case LESS_THAN_OR_EQUAL_OPERATION_NAME:
        return new LessThanOrEqualOperation(fieldName, data);
      case GREATER_THAN_OPERATION_NAME:
        return new GreaterThanOperation(fieldName, data);
      case GREATER_THAN_OR_EQUAL_OPERATION_NAME:
        return new GreaterThanOrEqualOperation(fieldName, data);
      case BETWEEN_OPERATION_NAME:
        return new BetweenOperation(fieldName, data);
      case LIKE_OPERATION_NAME:
        return new LikeOperation(fieldName, data);
    }

    throw new Error('Operation not defined');
  }
}
