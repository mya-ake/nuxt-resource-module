import path from 'path';

import { ResourceModuleOption } from './interfaces';

const defaultOption: ResourceModuleOption = {
  methods: ['get', 'delete', 'head', 'post', 'put', 'patch'],
};

export default function nuxtResourceModule(
  _moduleOption: ResourceModuleOption,
) {
  const moduleOption: ResourceModuleOption = {
    ...defaultOption,
    ...this.options['resource-module'],
    ..._moduleOption,
  };

  this.addPlugin({
    src: path.resolve(__dirname, 'templates', 'plugin.template.js'),
    ssr: true,
    options: {
      pluginSrc: path.resolve(__dirname, 'index.js'),
      ...moduleOption,
    },
  });
}
