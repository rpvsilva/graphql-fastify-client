const resolvers = {
  Query: {
    hello: async () => 'Hello world!',
    add: async (_: unknown, args: { x: number; y: number }) => args.x + args.y
  }
};

export default resolvers;