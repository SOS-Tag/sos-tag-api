import { ClassType, Field, Int, ObjectType } from 'type-graphql';

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

const PaginatedResponse = <T>(TItemClass: ClassType<T>): any => {
  @ObjectType({ description: 'Generic paginated response', isAbstract: true })
  abstract class GenericPaginatedResponse extends Error {
    @Field(() => [TItemClass])
    items: T[];
    @Field(() => Int)
    currentPage: number;
    @Field(() => Int)
    totalPages: number;
    @Field()
    hasMore: boolean;
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

export { BooleanResponse, Error, ObjectsResponse, PaginatedResponse, SingleObjectResponse };
