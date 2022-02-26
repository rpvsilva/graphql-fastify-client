import { buildSchema } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from 'schema/resolvers';
import Schema from 'schema/index.gql';
import { PORT, isProd } from 'constants/index';
import GraphQLFastify from 'server';

const { app } = new GraphQLFastify({
  debug: !isProd,
  schema: makeExecutableSchema({
    typeDefs: buildSchema(Schema),
    resolvers,
  }),
  playground: {
    introspection: !isProd,
  },
});

app.listen(+PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port 0.0.0.0:${PORT}`);
});
