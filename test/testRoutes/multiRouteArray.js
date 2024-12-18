export default [
  {
    path: '/arrayroute1',
    handler: async (request, reply) => {
      return { route: 1 };
    }
  },
  {
    path: '/arrayroute2',
    handler: async (request, reply) => {
      return { route: 2 };
    }
  }
];
