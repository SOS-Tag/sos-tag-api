import { Order } from '@utils/sort';
import { Field, InputType } from 'type-graphql';

@InputType({ description: 'Sort options' })
class QuerySortOptions {
  @Field()
  field?: string;
  @Field(() => String)
  order?: Order;
}

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
  @Field(() => QuerySortOptions)
  sort?: QuerySortOptions;
}

export { QueryOptions };
