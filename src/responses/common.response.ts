import { ClassType, Field, Int, InterfaceType, ObjectType } from 'type-graphql';

const SingleObjectResponse = <T>(TItemSchema: ClassType<T>): any => {
  @ObjectType({ description: 'Generic single object response', isAbstract: true })
  abstract class GenericSingleObjectResponse extends Error {
    @Field(() => TItemSchema, { nullable: true })
    response?: T;
  }

  return GenericSingleObjectResponse;
};

const ObjectsResponse = <T>(TItemSchema: ClassType<T>): any => {
  @ObjectType({ description: 'Generic multiple objects response', isAbstract: true })
  abstract class GenericObjectsResponse extends Error {
    @Field(() => [TItemSchema], { nullable: true })
    response?: T[];
  }

  return GenericObjectsResponse;
};

@InterfaceType()
abstract class IPaginationDetails {
  @Field(() => Int)
  totalItems: number;
  @Field(() => Int)
  totalPages: number;
  @Field(() => Int)
  currentPage: number;
  @Field()
  hasMore: boolean;
}

const PaginatedResponse = <T>(TEntitySchema: ClassType<T>): any => {
  @ObjectType({ description: 'Generic paginated response', isAbstract: true })
  abstract class GenericPaginatedResponse extends Error {
    @Field(() => TEntitySchema)
    response?: T;
  }

  return GenericPaginatedResponse;
};

@ObjectType({ description: 'Error with message' })
class InputError {
  @Field()
  type: string;
  @Field()
  name: string;
  @Field()
  detail: string;
}

@ObjectType({ description: 'Error with message and the associated field' })
class ExtendedError {
  @Field()
  type: string;
  @Field()
  code: number;
  @Field()
  title: string;
  @Field()
  message: string;
  @Field()
  timestamp: string;
  @Field()
  retryAfter: number;
  @Field()
  wwwAuthenticate: string;
  @Field(() => [InputError])
  fields?: InputError[];
}

@ObjectType({ description: 'Errors (collection of one or multiple errors)' })
class Error {
  @Field(() => ExtendedError, { nullable: true })
  error?: ExtendedError;
}

@ObjectType({ description: 'Boolean response' })
class BooleanResponse extends SingleObjectResponse(Boolean) {}

export { BooleanResponse, Error, IPaginationDetails, ObjectsResponse, PaginatedResponse, SingleObjectResponse };
