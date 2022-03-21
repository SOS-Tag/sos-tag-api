import { IPaginationDetails, ObjectsResponse, PaginatedResponse, SingleObjectResponse } from '@responses/common.response';
import SheetSchema from '@schemas/sheet.schema';
import { Field, ObjectType } from 'type-graphql';

@ObjectType({ implements: IPaginationDetails, description: 'Sheet after paginaation was applied' })
class PaginatedSheets extends IPaginationDetails {
  @Field(() => [SheetSchema])
  items: SheetSchema[];
}

@ObjectType({ description: 'Sheet response' })
class SheetResponse extends SingleObjectResponse(SheetSchema) {}

@ObjectType({ description: 'Sheets response' })
class SheetsResponse extends ObjectsResponse(SheetSchema) {}

// @ObjectType({ description: 'Paginated sheets response' })
// class PaginatedSheetsResponse extends PaginatedResponse(SheetSchema) {}

@ObjectType({ description: 'Paginated sheets response' })
class PaginatedSheetsResponse extends PaginatedResponse(PaginatedSheets) {}

export { PaginatedSheetsResponse, SheetResponse, SheetsResponse };
