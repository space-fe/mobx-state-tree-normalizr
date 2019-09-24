# mobx-state-tree-normalizr

Normalizr for mobx-state-tree

## Usage

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
import { types } from "mobx-state-tree";
import { normalize } from "mobx-state-tree-normalizr";

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

const normalizedData = normalize(originalData, Article);

// normalizedData = {
//   result': '123',
//   entities: {
//     'article': {
//       '123': {
//         id: '123',
//         title: 'My awesome blog post',
//         author: '1'
//       }
//     },
//     'user': {
//       '1': {id: '1', name: 'Nana', gender: 'm'}
//     }
//   }
// }
```
