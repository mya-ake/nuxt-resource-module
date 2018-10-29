import { Vue, VueConstructor } from 'vue/types/vue';
import * as VueRouter from 'vue-router/types/vue';

import { Resource } from '@/core';

export default (resource: Resource) => {
  const install = (Vue: VueConstructor) => {
    Vue.mixin({
      beforeRouteEnter(to, from, next) {
        next(async (vm: Vue) => {
          const responses = await resource.requestDelayedRequest();
          responses.forEach(response => {
            if (response.status !== 200) {
              return;
            }
            const { data } = response;
            Object.entries(data).forEach(([key, value]) => {
              if (key in vm) {
                vm[key] = value;
              } else {
                console.warn(
                  '[nuxt-resrouce-module]',
                  `Please add ${key} to the data property`,
                );
              }
            });
          });
        });
      },
    });
  };
  return { install };
};
