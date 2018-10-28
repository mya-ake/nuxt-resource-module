import Vue from 'vue';

import { buildPlugin } from '<%= options.pluginSrc %>';

export default ({ $axios }, inject) => {
  if (typeof $axios === 'undefined') {
    throw new Error('Please install `@nuxt/aixos`.');
  }
  const { resource, ResroucePlugin } = buildPlugin({
    axios: $axios,
    isServer: process.server
  });

  Vue.use(ResroucePlugin);
  inject('_resource', resource);
};
