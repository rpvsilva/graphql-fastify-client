const resolvers = {
  Query: {
    hello: async (): Promise<string> => 'Hello world!',
    add: async (_: unknown, args: { x: number; y: number }): Promise<number> => args.x + args.y,
  },
};

export default resolvers;
