import { FastifyRequest } from 'fastify';
import { GraphQLSchema } from 'graphql';
import { RenderPageOptions } from 'graphql-playground-html';
import { ObjectOfAny } from '../../types/misc';

export type GraphQLFastifyConfig = {
  schema: GraphQLSchema;
  debug?: boolean;
  playground?: PlaygroundOptions;
  context?: (request: FastifyRequest) => ObjectOfAny;
};

type PlaygroundOptions = RenderPageOptions & {
  enabled?: boolean;
  endpoint?: string;
  introspection?: boolean;
};

export type GraphQLBody = {
  query: string;
  operationName?: string;
  variables?: { [key: string]: ObjectOfAny };
};
