import { renderPlaygroundPage } from 'graphql-playground-html';
import LRU, { Lru } from 'tiny-lru';
import { isProd } from 'constants/index';
import { GraphQLBody, GraphQLFastifyConfig } from 'server/types';
import { CompiledQuery, compileQuery, isCompiledQuery } from 'graphql-jit';
import { parse } from 'graphql';
import { postMiddleware } from 'server/middlewares';
import { GraphqlFastifyCache } from './types/cache';
import cache from './cache';
import { generateCacheKey, getCacheTtl, isIntrospectionQuery } from './utils';
import { FastifyInstance } from 'fastify';

class GraphQLFastify {
  private app: FastifyInstance | undefined;
  private queriesCache: Lru<CompiledQuery>;
  private config: GraphQLFastifyConfig;
  private cache: GraphqlFastifyCache | undefined;

  constructor(config: GraphQLFastifyConfig) {
    this.config = config;
    this.queriesCache = LRU(1024);

    if (config.cache) {
      this.cache = cache(config.cache);
    }
  }

  public applyMiddleware(app: FastifyInstance): void {
    this.app = app;

    this.enableGraphQLRequests();

    this.configPlayground();
  }

  private enableGraphQLRequests = () => {
    const { schema } = this.config;

    this.app?.post('/', postMiddleware(this.config), async (request, reply) => {
      const { query, operationName, variables = {} } = request.body as GraphQLBody;
      const cacheKey = generateCacheKey(query, variables);
      const isIntroQuery = isIntrospectionQuery(operationName);

      if (!isIntroQuery) {
        const cachedValue = await this.cache?.get(cacheKey);

        if (cachedValue) return reply.code(200).send(cachedValue);
      }

      const queryCacheKey = `${query}${operationName}`;
      const parsedQuery = parse(query);
      let compiledQuery = this.queriesCache.get(queryCacheKey);

      if (!compiledQuery) {
        const compilationResult = compileQuery(schema, parsedQuery, operationName);

        if (isCompiledQuery(compilationResult)) {
          compiledQuery = compilationResult;
          this.queriesCache.set(queryCacheKey, compiledQuery);
        } else {
          return compilationResult;
        }
      }

      const context = this.config.context?.(request);
      const executionResult = await compiledQuery.query({}, context, variables);
      const hasErrors = executionResult.errors?.length;

      if (!isIntroQuery && !hasErrors) {
        const cacheTtl = getCacheTtl(parsedQuery, this.config.cache?.policy, operationName);

        if (cacheTtl) this.cache?.set(cacheKey, JSON.stringify(executionResult), cacheTtl);
      }

      return reply.status(200).send(executionResult);
    });
  };

  private configPlayground = (playgroundConfig?: GraphQLFastifyConfig['playground']) => {
    const { enabled = !isProd, endpoint = '/' } = playgroundConfig || {};

    if (!enabled) return;

    this.app?.get(endpoint, async (_, reply) => {
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
