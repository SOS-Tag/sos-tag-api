import { Field, InputType } from 'type-graphql';

// @InputType({ description: 'Paginator input' })
// class PaginatorInput {
//   @Field()
//   page: number;
//   @Field()
//   limit: number;
// }

@InputType({ description: 'Pagination options' })
class QueryPaginationOptions {
  @Field()
  page?: number;
  @Field()
  limit?: number;
}

@InputType({ description: 'Query options to apply on list' })
class QueryOptions {
  @Field(() => QueryPaginationOptions)
  pagination?: QueryPaginationOptions;
}

export { QueryOptions };
