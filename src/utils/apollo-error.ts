import { dateToString } from '@utils/date';
import { ApolloError } from 'apollo-server-errors';
import { GraphQLError } from 'graphql';

enum ApolloErrorMessages {
  GRAPHQL_PARSE_FAILED = 'The GraphQL operation string contains a syntax error.',
  GRAPHQL_VALIDATION_FAILED = "The GraphQL operation is not valid against the server's schema.",
  BAD_USER_INPUT = 'The GraphQL operation includes an invalid value for a field argument.',
  UNAUTHENTICATED = 'The server failed to authenticate with a required data source.',
  FORBIDDEN = 'The server was unauthorized to access a required data source.',
  PERSISTED_QUERY_NOT_FOUND = 'A client sent the hash of a query string to execute via automatic persisted queries, but the query was not in the APQ cache.',
  PERSISTED_QUERY_NOT_SUPPORTED = 'A client sent the hash of a query string to execute via automatic persisted queries, but the server has disabled APQ.',
  INTERNAL_SERVER_ERROR = 'An unspecified error occurred.',
}

class ExtendedApolloError extends ApolloError {
  constructor(type: string, message: string, detail: string) {
    super(message, undefined, {
      type,
      detail,
      timestamps: dateToString(Date.now()),
    });
  }
}

const generateExtendedApolloError = (originalError: GraphQLError) => {
  const type = originalError.extensions.code;
  const message = ApolloErrorMessages[type];
  const detail = originalError.message;

  return new ExtendedApolloError(type, message, detail);
};

export { ExtendedApolloError, generateExtendedApolloError };
