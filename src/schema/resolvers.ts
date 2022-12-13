import { ContextType } from 'types';

const resolvers = {
  Query: {
    hello: async (): Promise<string> => 'Hello world!',
    add: async (
      _: unknown,
      { x, y }: { x: number; y: number },
      { pubsub }: ContextType
    ): Promise<number> => {
      await pubsub.publish('add', { add: x + y });

      return x + y;
    },
  },
  Mutation: {
    sub: async (_: unknown, args: { x: number; y: number }): Promise<number> => args.x - args.y,
  },
  Subscription: {
    add: {
      subscribe: async (_: unknown, __: unknown, { pubsub }: ContextType) => {
        return pubsub.subscribe('add');
      },
    },
  },
};

export default resolvers;
