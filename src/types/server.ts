import { GraphQLSchema } from 'graphql';
import { ObjectOfAny } from './misc';

export type GraphQLBody = {
  query: string;
  operationName?: string;
  variables?: { [key: string]: ObjectOfAny };
};

export type GraphQLFastifyConfig = {
  schema: GraphQLSchema;
  debug?: boolean;
  playground?: {
    enabled?: boolean;
    endpoint?: string;
  };
};
