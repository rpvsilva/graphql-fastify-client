import fastify, { FastifyInstance } from 'fastify';
import { renderPlaygroundPage } from 'graphql-playground-html';
import LRU, { Lru } from 'tiny-lru';
import { isProd } from 'constants/index';
import { GraphQLBody, GraphQLFastifyConfig } from 'types/server';
import { CompiledQuery, compileQuery, isCompiledQuery } from 'graphql-jit';
import { parse } from 'graphql';
import { postMiddleware } from 'middlewares';

class GraphQLFastify {
  public app: FastifyInstance;
  private queriesCache: Lru<CompiledQuery>;
  private config: GraphQLFastifyConfig;

  constructor(config: GraphQLFastifyConfig) {
    this.config = config;
    this.queriesCache = LRU(1024);
    this.app = fastify({
      logger: config.debug,
    });

    this.enableGraphQLRequests();

    this.configPlayground();
  }

  private enableGraphQLRequests = () => {
    const { schema } = this.config;

    this.app.post('/', postMiddleware(this.config), async (request, reply) => {
      const context = this.config.context?.(request);

      const { query, operationName, variables = {} } = request.body as GraphQLBody;

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

      const executionResult = await compiledQuery.query({}, context, variables);

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
