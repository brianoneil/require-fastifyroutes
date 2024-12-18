export default {
  routes: [
    {
      path: '/multiroute1',
      handler: async (request, reply) => {
        return { route: 1 };
      }
    },
    {
      path: '/multiroute2',
      handler: async (request, reply) => {
        return { route: 2 };
      }
    }
  ]
};
