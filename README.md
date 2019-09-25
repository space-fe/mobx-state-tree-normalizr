mobx-state-tree-normalizr
Mobx-state-tree-normalizr helps you normalize data with mobx-state-tree's model definition.

Install
Install from NPM repository using yarn or npm

npm install mobx-state-tree-normalizr
yarn add mobx-state-tree-normalizr
Motivation
Mobx-state-tree provides a way to denomalize related data with reference but lacks of data normalization support. In order to nomalize the data retrieved from the backend service, people may use third-party libraries like normalizr. However, these kinds of packages may need you to define another schema other than mobx-state-tree built-in type.model for a specific resource which will introduce duplication to the schema definition.

Mobx-state-tree-normalizr is tool that aims to normalize your data based on mobx-state-tree built-in types.model without third-party schema definition.

Notes: If you are not familiar with the nomalization term, please take a look at its documentation for more information.

Instructions
normalize
mobx-state-tree-normalizr only provide a method call normalize, it take two params:

First parameter: originalData(the nested data you might fetch from somewhere)
Second parameter: model(the model of mobx-state-tree)
parameter: model
We use mobx-state-tree's types.model to normalize our data. But because model in mst is very powerful and elastic, we need some constraints when you define your model:

Mobx-state-tree-normalizr use model's name to define your entity type, so you should define your model like this types.model('some name', {....}). If the name parameter is not given, We will consider that this model corresponds to not an entity.

An entity must have a primary key distinguishing itself from other entities with the same type. The primary key will be the attribute with the types.identifier type in your model if provided and will use id as the default value.

Usage
The original data might look like this:

const originalData = {
id: "123",
title: "My awesome blog post",
author: {
id: "1",
name: "Nana",
gender: "m",
},
};
Now, when we use mobx-state-tree, we can build a model for this data structure like this:

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
After that, we can use these models as schemas to normalize our nested data

import { normalize } from "mobx-state-tree-normalizr";

const normalizedData = normalize(originalData, Article);
Now, normalizedData will be:

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
