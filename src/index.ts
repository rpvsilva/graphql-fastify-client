import fastify from 'fastify';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from 'schema/resolvers';
import typeDefs from 'schema/index.gql';
import { PORT, isProd } from 'constants/index';
import context from 'context';
import { ContextType, Resolvers } from 'types';
import GraphQLFastify, { Cache } from 'graphql-fastify-server';
import middlewares from 'middlewares';

const cache: Cache<ContextType, Resolvers> = {
  defaultTTL: 1000,
  storage: 'memory',
  policy: {
    add: {
      ttl: 1000,
    },
    sub: {
      ttl: 15000,
      scope: 'PRIVATE',
    },
  },
  extraCacheKeyData: (ctx) => {
    const { locale } = ctx;

    return locale;
  },
};

const app = fastify();

const server = new GraphQLFastify({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
  }),
  context,
  cache,
  debug: !isProd,
  middlewares,
  playground: {
    introspection: !isProd,
  },
});

server.applyMiddleware({ app, path: '/' });

app.listen(+PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port http://0.0.0.0:${PORT}`);
});
