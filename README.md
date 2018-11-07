# Nuxt.js Resource Module

## ⚠️Alpha version

## Status

[![CircleCI](https://circleci.com/gh/mya-ake/nuxt-resource-module/tree/master.svg?style=svg)](https://circleci.com/gh/mya-ake/nuxt-resource-module/tree/master)

## Features

- [@nuxtjs/axios](https://github.com/nuxt-community/axios-module)をラップした HTTP リクエストモジュール
- asyncData と fetch でリクエストしたリクエストを遷移後まで遅延させられます
  - リンクをクリックしてすぐに遷移します
  - 遷移後リクエストを行い、response.dataをそのままdataプロパティにマッピングします
  - SSR 時は遅延させずにそのままリクエストします
- キャンセル可能なリクエストを簡単に作れます
  - 遷移するときはリクエスト中のリクエストを自動でキャンセルします
- リクエスト時にレスポンスを加工する処理を追加できます

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
    async requestSuggestion() {
      this.$_resource.cancel('/users');
      const response = await this.$_resource.mayBeCancel.get({ url: '/users' });
      if (response.canceled === true) {
        // when cancel
      }
    },
  },
}

// Vuex
export const actions = {
  async request() {
      this.$_resource.cancel('/users');
      const response = await this.$_resource.mayBeCancel.get({ url: '/users' });
      if (response.canceled === true) {
        // when cancel
      }
  }
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