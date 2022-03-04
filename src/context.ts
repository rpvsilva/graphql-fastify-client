import { FastifyRequest } from 'fastify';

export default (request: FastifyRequest) => {
  const { headers } = request;

  return {
    isAutheticated: !!headers.authorization,
    locale: headers['accept-language'],
  };
};
