import { buildSchema, parse } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import fastify from "fastify";
import { compileQuery, isCompiledQuery } from "graphql-jit";
import { renderPlaygroundPage } from 'graphql-playground-html';
import { GraphQLBody } from 'types/server';
import resolvers from 'schema/resolvers';
import Schema from 'schema/index.gql';

const schema = makeExecutableSchema({
  typeDefs: buildSchema(Schema),
  resolvers,
});

const app = fastify({
  logger: true,
});

// Render playground page
app.get('/', async (_, reply) => {
  return reply
    .headers({
      'Content-Type': 'text/html',
    })
    .send(renderPlaygroundPage({
      endpoint: '/'
    }));
});

app.post('/', async (request, reply) => {
  const { body } = request;
  const { query, operationName, variables = {} } = body as GraphQLBody;

  const queryParsed = parse(query);
  const compiledQuery = compileQuery(schema, queryParsed, operationName);
  
  if (!isCompiledQuery(compiledQuery)) {
    console.error(compiledQuery);
    throw new Error("Error compiling query");
  }

  const executionResult = await compiledQuery.query({}, {}, variables);
  return reply.status(200).send(executionResult);
});

app.listen(8080, () => {
  console.log("Server listening on port 0.0.0.0:8080");
});