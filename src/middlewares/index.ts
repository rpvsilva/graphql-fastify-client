import { Middlewares } from 'graphql-fastify-server';
import { ContextType, Resolvers } from 'types';

const middlewares: Middlewares<ContextType, Resolvers> = [
  {
    handler: (context: ContextType): void => {
      const { isAutheticated } = context;

      if (!isAutheticated) throw new Error('Unauthorized');
    },
    operations: ['sub'],
  },
];

export default middlewares;
