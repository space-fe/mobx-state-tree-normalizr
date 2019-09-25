# mobx-state-tree-normalizr

Normalizr for mobx-state-tree

## Install

Install from NPM repository using yarn or npm

```javascript
npm install mobx-state-tree-normalizr
```

```javascript
yarn add mobx-state-tree-normalizr
```

## Motivation

mobx-state-tree-normalizr helps awesome [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) and [normalizr](https://github.com/paularmstrong/normalizr) work together.

In [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree), we use `types.model` to describe the shape of your data. On the other hand, in [normalizr](https://github.com/paularmstrong/normalizr), we use `schema`, which is quite like types.model in some way. That means you need to do some extra work.

mobx-state-tree-normalizr is aims to normalize your data by using `types.model` but not `schema`.

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
