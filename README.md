# Nuxt.js Resource Module

## ⚠️Alpha version

## Status

[![CircleCI](https://circleci.com/gh/mya-ake/nuxt-resource-module/tree/master.svg?style=svg)](https://circleci.com/gh/mya-ake/nuxt-resource-module/tree/master)

## Features

- [@nuxtjs/axios](https://github.com/nuxt-community/axios-module)をラップした HTTP リクエストモジュール
- asyncData と fetch でリクエストしたリクエストを遷移後まで遅延させられます
  - リンクをクリックしてすぐに遷移します
  - 遷移後リクエストを行い、response.data をそのまま data プロパティにマッピングします
  - SSR 時は遅延させずにそのままリクエストします
- キャンセル可能なリクエストを簡単に作れます
  - 遷移するときはリクエスト中のリクエストを自動でキャンセルします
- リクエスト時にレスポンスを加工する処理を追加できます
- 内部でエラーハンドリングしているので使うときにエラーが投げられることはありません

---

- HTTP request module wrapping [@nuxtjs/axios](https://github.com/nuxt-community/axios-module)
- AsyncData and fetch requested requests can be delayed until after transition
  - Immediate transition
  - Make a request after the transition and map response.data to the data property
  - When requesting SSR, do not delay but request as is
- Easily create cancelable requests
  - When making a transition, cancel request in request automatically
- You can add a process to modify the response on request
- Since error handling is done internally, no error is thrown when using

## Install

```
$ yarn add nuxt-resource-module
```

### nuxt.config.js

```JavaScript
module.exports = {
  // ...
  modules: [
    'nuxt-resource-module', // required before @nuxtjs/axios
    '@nuxtjs/axios',
  ],
  // ...

  // options (See options section)
  'resource-module': {
    methods: ['get', 'post'],
  },
};
```

## Usage

```JavaScript
export default {
  // asyncData
  async asyncData({ app, error }) {
    // default request
    const response = await app.$_resource.get({
      url: '/users',
    });

    // delay request
    const response = await app.$_resource.delay.get({
      url: '/users',
      // response.data mapper
      dataMapper(response: ResourceResponse) {
        const { delayed, data } = response;
        return delayed ? { users: [] } : { users: data.users };
      },

      // response
      processor(response: ResourceResponse) {
        if (response.status !== 200) {
          error({ statusCode: response.status, message: 'Request error' })
        }
        return response;
      },
    });
  },

  // methods
  methods: {
    // cancel
    async searchUser() {
      this.$_resource.cancel('/users/search');
      const response = await this.$_resource.mayBeCancel.get({ url: '/users/search' });
      if (response.canceled === true) {
        // when cancel
      }
    },
  },
}

// Vuex
export const actions = {
  async searchUser() {
      this.$_resource.cancel('/users/search');
      const response = await this.$_resource.mayBeCancel.get({ url: '/users/search' });
      if (response.canceled === true) {
        // when cancel
      }
  }
}
```

## API

### Methods

#### Request methods

##### Default request methods

- $\_resource.request(config: ResourceRequestConfig)
- $\_resource.get(config: ResourceRequestConfig)
- $\_resource.delete(config: ResourceRequestConfig)
- $\_resource.head(config: ResourceRequestConfig)
- $\_resource.post(config: ResourceRequestConfig)
- $\_resource.put(config: ResourceRequestConfig)
- $\_resource.patch(config: ResourceRequestConfig)

##### Delay request methods

クライアントとサーバーで動作が変わります。  
There are client and server behavior changes.

client: asyncData または fetch で利用した場合は、遷移が確定してからリクエストが呼ばれます。  
server: デフォルトメソッドを使ったときと同じです。使ったときにそのままリクエストを送ります。

client: When used with asyncData or fetch, it is called after the transition is confirmed.  
server: Same as default method. Send a request when called.

- $\_resource.delay.request(config: ResourceRequestConfig)
- $\_resource.delay.get(config: ResourceRequestConfig)
- $\_resource.delay.delete(config: ResourceRequestConfig)
- $\_resource.delay.head(config: ResourceRequestConfig)
- $\_resource.delay.post(config: ResourceRequestConfig)
- $\_resource.delay.put(config: ResourceRequestConfig)
- $\_resource.delay.patch(config: ResourceRequestConfig)

##### May be cancel request methods

キャンセル可能なリクエストになります。`$_resource.cancel()`と一緒に使います。  
It will be a request that can be canceled. Use with `$_resource.cancel()`.

- $\_resource.mayBeCancel.request(config: ResourceRequestConfig)
- $\_resource.mayBeCancel.get(config: ResourceRequestConfig)
- $\_resource.mayBeCancel.delete(config: ResourceRequestConfig)
- $\_resource.mayBeCancel.head(config: ResourceRequestConfig)
- $\_resource.mayBeCancel.post(config: ResourceRequestConfig)
- $\_resource.mayBeCancel.put(config: ResourceRequestConfig)
- $\_resource.mayBeCancel.patch(config: ResourceRequestConfig)

#### Cancel methods

- $\_resource.cancel(url: ResourceRequestConfig.url)
- $\_resource.cancelAll()
  - Automatically call with beforeEach

#### Delay methods

- $\_resource.requestDelayedRequest()
  - Request all delayed requests
  - Automatically call within the `next` function of beforeRouteEnter.
- $\_resource.clearDelayedRequest()
  - Clear all delayed requests
  - Automatically call with beforeEach

#### Extending methods

- $\_resource.setEachProcessor(fn: Function)

### Types

#### ResourceRequestConfig

Extends [AxiosRequestConfig](https://github.com/axios/axios#request-config)

```TypeScript
export interface ResourceRequestConfig extends AxiosRequestConfig {
  url: string;
  dataMapper?: (response: ResourceResponse) => any;
  processor?: (response: ResourceResponse) => any;
}
```

e.g.

```JavaScript
{
  url: '/users/search',  // require
  params: { // Can also use axios config
    query: 'Alice',
  },
  dataMapper(response) {  // option
    const { delayed, data } = response;
    return delayed ? { users: [] } : { users: data.users };
  },
  processor(response) { // option
    if (response.status !== 200) {
      error({ statusCode: response.status, message: 'Request error' })
    }
    return response;
  },
}
```

#### ResourceResponse

Extends [AxiosResponse](https://github.com/axios/axios#response-schema)

```TypeScript
export interface ResourceResponse extends AxiosResponse {
  canceled: boolean;
  delayed: boolean;
}
```

## Extending

### Each processor

#### plubins/resource-module.js

```JavaScript
export default ({ app }) => {
  const { $_resource } = app;
  const eachProcessor = (response) => {
    return {
      status: response.status,
      isError: response.status !== 200,
      data: response.data,
      delayed: response.delayed,
      canceled: response.canceled,
    };
  };
  $_resource.setEachProcessor(eachProcessor);
};
```

#### nuxt.config.js

```JavaScript
module.exports = {
  // ...
  modules: [
    'nuxt-resource-module', // required before @nuxtjs/axios
    '@nuxtjs/axios',
  ],
  // ...

  plugins: [
    '~/plugins/resource-module',
  ],
};
```

#### application code

```JavaScript
export default {
  async asyncData({ app }) {
    const response = await app.$_resource.get({
      url: '/users',
    });
    console.log(response) // { status: 200, isError: false, data: ... }
  },
};
```

## Options

### methods

- Default: `['get', 'delete', 'head', 'post', 'put', 'patch']`

使うリクエストメソッドを定義できます。

e.g.

```JavaScript
// nuxt.config.js
module.exports = {
  // ...
  'resource-module': {
    methods: ['get'],
  },
};
```

When

```JavaScript
async asyncData({ app }) {
  // ok
  const response = await app.$_resource.get({
    url: '/users',
  });

  // undefined
  const response = await app.$_resource.post({
    url: '/users',
    data: {
      name: 'new user',
    },
  });
},
```
