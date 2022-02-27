import { DefinitionNode, DocumentNode, OperationDefinitionNode, SelectionNode } from 'graphql';
import { CachePolicy } from 'server/types/cache';
import { ObjectOfAny } from 'types/misc';
import { hashString } from './string';

const defaultQueryFields = ['__typename', '__schema', '__type'];

export const isIntrospectionQuery = (operationName?: string): boolean => {
  return operationName === 'IntrospectionQuery';
};

/**
 * @returns It returns the ttl of the cache. If it's 0 then the query it's not cacheable
 */
export const getCacheTtl = (
  query: DocumentNode,
  cachePolicy?: CachePolicy,
  operationName?: string
): number => {
  if (!cachePolicy) return 0;
  const {
    selectionSet: { selections },
  } = getOperation(query.definitions, operationName);

  const cacheTtls = getCacheableTtls(selections, cachePolicy);

  if (selections.length !== cacheTtls.length) return 0;

  return Math.min(...cacheTtls);
};

const getCacheableTtls = (selections: readonly SelectionNode[], cachePolicy: CachePolicy) => {
  return selections.reduce<number[]>((acc, selection) => {
    if (selection.kind !== 'Field' || defaultQueryFields.includes(selection.name.value)) {
      return acc;
    }
    const name = selection.name.value;
    const cacheRule = cachePolicy[name];

    if (!cacheRule) return acc;

    return [...acc, cacheRule.ttl];
  }, []);
};

const getOperation = (
  definitions: readonly DefinitionNode[],
  operationName?: string
): OperationDefinitionNode => {
  if (!operationName) return definitions[0] as OperationDefinitionNode;

  return definitions.find(
    (def) => def.kind === 'OperationDefinition' && def.name?.value === operationName
  ) as OperationDefinitionNode;
};

export const generateCacheKey = (query: string, variables: ObjectOfAny = {}): string => {
  const string = `${query}-${JSON.stringify(variables)}`;

  return `gfc:${hashString(string)}`;
};
