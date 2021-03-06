import Vue from 'vue';

import { buildPlugin } from '<%= options.pluginSrc %>';

export default ({ app, $axios }, inject) => {
  if (typeof $axios === 'undefined') {
    throw new Error('Please install `@nuxt/aixos`.');
  }
  const { resource, ResroucePlugin } = buildPlugin({
    axios: $axios,
    isServer: process.server,
    methods: '<%= options.methods %>'.split(','),
  });

  // add plugin
  Vue.use(ResroucePlugin);
  inject('_resource', resource);

  const { router } = app;
  router.beforeEach((to, from, next) => {
    // clear delayed request
    resource.clearDelayedRequest();
    // cancel requests
    resource.cancelAll();
    next();
  });
};
