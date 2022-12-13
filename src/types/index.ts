import context from 'context';
import { PubSub } from 'graphql-fastify-server';
import resolvers from 'schema/resolvers';

export type ContextType = ReturnType<typeof context> & {
  pubsub: PubSub;
};

export type Resolvers = typeof resolvers['Query'] & typeof resolvers['Mutation'];
