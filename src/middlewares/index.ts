import { isProd } from 'constants/index';
import {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
  RouteShorthandOptions,
} from 'fastify';
import { GraphQLBody, GraphQLFastifyConfig } from 'types/server';

const disableIntrospection = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
  playground: GraphQLFastifyConfig['playground'] = {}
) => {
  const { operationName } = request.body as GraphQLBody;
  const { introspection = !isProd } = playground;

  if (!introspection && operationName === 'IntrospectionQuery') {
    return reply.code(400).send(Error('IntrospectionQuery is disabled on GraphQLFastify.'));
  }

  return done();
};

export const postMiddleware = (config: GraphQLFastifyConfig): RouteShorthandOptions => {
  return {
    preHandler: (...args) => disableIntrospection(...args, config.playground),
  };
};