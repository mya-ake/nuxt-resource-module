# Nuxt.js Resource Module

## ⚠️Under development⚠️

正常に動かない可能性があります。  
There is a possibility that it does not move normally.

## Status

[![CircleCI](https://circleci.com/gh/mya-ake/nuxt-resource-module/tree/master.svg?style=svg)](https://circleci.com/gh/mya-ake/nuxt-resource-module/tree/master)

## Features

- [@nuxtjs/axios](https://github.com/nuxt-community/axios-module)をラップした HTTP リクエストモジュール
- asyncData と fetch でリクエストしたリクエストを遷移後まで遅延させられます
  - リンクをクリックしてすぐに遷移します
  - 遷移後リクエストを行い、response.dataをそのままdataプロパティにマッピングします
  - SSR 時は遅延させずにそのままリクエストします
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
}
```

## Usage

```JavaScript
async asyncData({ app, error }) {
  // default request
  const response = await app.$_resource.get({
    url: '/users',
  });

  // delay request
  const response = await app.$_resource.delay.get({
    url: '/users',
    // response.data mapper
    dataMapper(response: AxiosResponse) {
      const { data } = response;
      return data ? { users: data.users } : { users: [] };
    },

    // response 
    processor(response: AxiosResponse) {
      if (response.status !== 200) {
        error({ statusCode: response.status, message: 'Request error' })
      }
      return response;
    },
  });
}
```

## Options

coming soon...

- default processor
- etc.