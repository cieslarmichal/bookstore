import { Mapper } from '../../../../../../common/types/mapper';
import { LineItem } from '../../../../domain/entities/lineItem/lineItem';
import { LineItemEntity } from '../lineItemEntity/lineItemEntity';

export type LineItemMapper = Mapper<LineItemEntity, LineItem>;
