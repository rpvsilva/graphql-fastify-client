import fastify, { FastifyInstance } from 'fastify';
import { renderPlaygroundPage } from 'graphql-playground-html';
import LRU, { Lru } from 'tiny-lru';
import { isProd } from 'constants/index';
import { GraphQLBody, GraphQLFastifyConfig } from 'types/server';
import { CompiledQuery, compileQuery, isCompiledQuery } from 'graphql-jit';
import { parse } from 'graphql';

class GraphQLFastify {
  public app: FastifyInstance;
  private queriesCache: Lru<CompiledQuery>;

  constructor(config: GraphQLFastifyConfig) {
    this.queriesCache = LRU(1024);
    this.app = fastify({
      logger: config.debug,
    });

    this.config(config);
  }

  private config = (config: GraphQLFastifyConfig) => {
    const { playground, schema } = config || {};

    this.enableGraphQLRequests(schema, playground?.introspection);

    this.configPlayground(playground);
  };

  private enableGraphQLRequests = (
    schema: GraphQLFastifyConfig['schema'],
    introspection = !isProd
  ) => {
    this.app.post('/', async ({ body }, reply) => {
      const { query, operationName, variables = {} } = body as GraphQLBody;

      if (!introspection && operationName === 'IntrospectionQuery') {
        return reply.code(400).send(Error('IntrospectionQuery is disabled on GraphQLFastify.'));
      }

      const cacheKey = `${query}${operationName}`;
      let compiledQuery = this.queriesCache.get(`${query}${operationName}`);

      if (!compiledQuery) {
        const compilationResult = compileQuery(schema, parse(query), operationName);

        if (isCompiledQuery(compilationResult)) {
          compiledQuery = compilationResult;
          this.queriesCache.set(cacheKey, compiledQuery);
        } else {
          return compilationResult;
        }
      }

      const executionResult = await compiledQuery.query({}, {}, variables);

      return reply.status(200).send(executionResult);
    });
  };

  private configPlayground = (playgroundConfig?: GraphQLFastifyConfig['playground']) => {
    const { enabled = !isProd, endpoint = '/' } = playgroundConfig || {};

    if (!enabled) return;

    this.app.get(endpoint, async (_, reply) => {
      return reply
        .headers({
          'Content-Type': 'text/html',
        })
        .send(
          renderPlaygroundPage({
            ...playgroundConfig,
            endpoint,
          })
        );
    });
  };
}

export default GraphQLFastify;
