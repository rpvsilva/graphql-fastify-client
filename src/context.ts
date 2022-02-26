import { FastifyRequest } from 'fastify';

export default (request: FastifyRequest) => {
  const { authorization } = request.headers;

  return {
    isAutheticated: !!authorization,
  };
};
