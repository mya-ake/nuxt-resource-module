import { Resource } from './core';
import pluginBuilder from './builder/plugin-builder';
import { ResourceConstructor } from './interfaces';

export const buildPlugin = (option: ResourceConstructor) => {
  const resource = new Resource(option);
  const ResroucePlugin = pluginBuilder(resource);
  return {
    resource,
    ResroucePlugin,
  };
};
