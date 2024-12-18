export default {
  path: '/configroute',
  config: {
    handler: async (request, reply) => {
      return { hello: 'config' };
    }
  }
};
