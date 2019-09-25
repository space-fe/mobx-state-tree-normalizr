# mobx-state-tree-normalizr

mobx-state-tree-normalizr helps awesome [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) and [normalizr](https://github.com/paularmstrong/normalizr) work together.

## Install

Install from NPM repository using yarn or npm

```javascript
npm install mobx-state-tree-normalizr
```

```javascript
yarn add mobx-state-tree-normalizr
```

## Motivation

In [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree), we use `types.model` to describe the shape of your data. On the other hand, in [normalizr](https://github.com/paularmstrong/normalizr), we use `schema`, which is quite like types.model do in some way. That means you need to do some extra work.

mobx-state-tree-normalizr is tool that aims to normalize your data by using `types.model` but not `schema` that may make your data flow more clear and easy to manage

## Instructions

### normalize

mobx-state-tree-normalizr only provide a method call `normalize`, it take two params:

1. First parameter: `originalData`(the nested data you might fetch from somewhere)
2. Second parameter: `model`(the model of [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree))

### parameter: model

We use [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)'s `types.model` to normalize your data. But because model in mst is very powerful and elastic, we need some constraints when you define your model:

1. If your current model is a entity type, you need to give this model a name when you define your model, just like: `types.model('some name', {...}`. If this model is not a entity, some time it would happen like it is a collection of some kind of entity. In this case, you should use anonymous model, like this: `types.model({...})`.<br/>In short, mobx-state-tree-normalizr use model's name to define your entity type

2. A entity must have a primary key which distinguish from other entity in the same entity type. We recommend you use `types.identifier` as the primary key. If you don't give, we use `id` attribute as default.

## Usage

The original data might look like this:

```javascript
const originalData = {
  id: "123",
  title: "My awesome blog post",
  author: {
    id: "1",
    name: "Nana",
    gender: "m",
  },
};
```

Now, when we use mobx-state-tree, we can build a model for this data structure like this:

```javascript
import { types } from "mobx-state-tree";

const User = types.model("user", {
  id: types.identifier,
  name: types.string,
  gender: types.enumeration("gender", ["m", "n"]),
});

const Article = types.model("article", {
  id: types.string,
  title: types.string,
  author: types.maybe(types.reference(types.late(() => User))),
});
```

After that, we can use these models as schemas to normalize our nested data

```javascript
import { normalize } from "mobx-state-tree-normalizr";

const normalizedData = normalize(originalData, Article);
```

Now, normalizedData will be:

```javascript
{
  result': '123',
  entities: {
    'article': {
      '123': {
        id: '123',
        title: 'My awesome blog post',
        author: '1'
      }
    },
    'user': {
      '1': {id: '1', name: 'Nana', gender: 'm'}
    }
  }
}
```
