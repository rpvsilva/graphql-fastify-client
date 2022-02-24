import fastify from 'fastify';
import { buildSchema, parse } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { CompiledQuery, compileQuery, isCompiledQuery } from 'graphql-jit';
import { renderPlaygroundPage } from 'graphql-playground-html';
import LRU from 'tiny-lru';
import { GraphQLBody } from 'types/server';
import resolvers from 'schema/resolvers';
import Schema from 'schema/index.gql';
import { PORT } from 'constants/config';

const queriesCache = LRU<CompiledQuery>(1024);

const schema = makeExecutableSchema({
  typeDefs: buildSchema(Schema),
  resolvers,
});

const app = fastify({
  logger: true,
});

// Render playground page
app.get('/', async (_, reply) => {
  return reply
    .headers({
      'Content-Type': 'text/html',
    })
    .send(
      renderPlaygroundPage({
        endpoint: '/',
      })
    );
});

app.post('/', async (request, reply) => {
  const { body } = request;
  const { query, operationName, variables = {} } = body as GraphQLBody;

  const cacheKey = `${query}${operationName}`;
  let compiledQuery = queriesCache.get(`${query}${operationName}`);

  if (!compiledQuery) {
    const compilationResult = compileQuery(schema, parse(query), operationName);

    if (isCompiledQuery(compilationResult)) {
      compiledQuery = compilationResult;
      queriesCache.set(cacheKey, compiledQuery);
    } else {
      return compilationResult;
    }
  }

  const executionResult = await compiledQuery.query({}, {}, variables);

  return reply.status(200).send(executionResult);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port 0.0.0.0:${PORT}`);
});
