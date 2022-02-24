import { ObjectOfAny } from './misc';

export type GraphQLBody = {
  query: string;
  operationName?: string;
  variables?: { [key: string]: ObjectOfAny };
};
