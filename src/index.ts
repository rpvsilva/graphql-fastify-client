import { buildSchema } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from 'schema/resolvers';
import Schema from 'schema/index.gql';
import { PORT, isProd } from 'constants/index';
import GraphQLFastify from 'server/server';
import context from 'context';
import { Cache } from 'server/types/cache';

const schema = makeExecutableSchema({
  typeDefs: buildSchema(Schema),
  resolvers,
});

const cache: Cache<typeof resolvers['Query']> = {
  defaultTTL: 1000,
  storage: 'memory',
  policy: {
    add: {
      ttl: 1000,
    },
  },
};

const { app } = new GraphQLFastify({
  schema,
  context,
  cache,
  debug: !isProd,
  playground: {
    introspection: !isProd,
  },
});

app.listen(+PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port 0.0.0.0:${PORT}`);
});
