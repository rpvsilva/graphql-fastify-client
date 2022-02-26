import { GraphQLSchema } from 'graphql';
import { RenderPageOptions } from 'graphql-playground-html';
import { ObjectOfAny } from './misc';

export type GraphQLBody = {
  query: string;
  operationName?: string;
  variables?: { [key: string]: ObjectOfAny };
};

type PlaygroundOptions = RenderPageOptions & {
  enabled?: boolean;
  endpoint?: string;
  introspection?: boolean;
};

export type GraphQLFastifyConfig = {
  schema: GraphQLSchema;
  debug?: boolean;
  playground?: PlaygroundOptions;
};
