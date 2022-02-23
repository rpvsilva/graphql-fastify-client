export type GraphQLBody = {
  query: string;
  operationName?: string;
  variables?: { [key: string]: any };
}