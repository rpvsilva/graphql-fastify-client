import context from 'context';
import resolvers from 'schema/resolvers';

export type ContextType = ReturnType<typeof context>;

export type Resolvers = typeof resolvers['Query'] & typeof resolvers['Mutation'];
