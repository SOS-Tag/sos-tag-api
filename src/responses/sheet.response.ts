import SheetSchema from '@schemas/sheet.schema';
import { ObjectType } from 'type-graphql';
import { ObjectsResponse, SingleObjectResponse } from './common.response';

@ObjectType({ description: 'Sheet response' })
class SheetResponse extends SingleObjectResponse(SheetSchema) {}

@ObjectType({ description: 'Sheets response' })
class SheetsResponse extends ObjectsResponse(SheetSchema) {}

export { SheetResponse, SheetsResponse };
