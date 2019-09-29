describe("normalize", () => {
  [22, null, undefined, "22", new Symbol(), true, () => {}].forEach(input => {
    test(`cannot normalize input that === ${input}`, () => {
      expect(normalize(input, types.model("test", {})).toThrow());
    });
  });

  test("cannot normalize without a types.model", () => {
    expect(normalize({})).toThrow();
    expect(normalize({}, Object.create())).toThrow();
  });

  test('cannot normalize without an identification', () => {
    const User = types.model('user', {
      name: types.string
    })

    const input = {
      name: 'ken'
    }

    expect(
  })

  test("does not modify the original input", () => {
    const User = types.model("user", {
      id: types.string,
      name: types.string,
    });

    const Article = types.model("article", {
      id: types.string,
      author: User,
    });

    const input = Object.freeze({
      id: "123",
      author: Object.freeze({
        id: "12",
        name: "Ben",
      }),
    });

    expect(() => normalize(input, Article)).not.toThrow();
  });

  test("does not create an entity for a model without name property", () => {
    const User = types.model("user", {
      id: types.string,
      name: types.string,
    });

    const Users = types.model({
      list: types.array(User),
    });

    const input = {
      list: [
        {
          id: "1",
          name: "jack",
        },
      ],
    };

    expect(normalize(input, Users).result).toBe(undefined);
  });

  test("can normalize entities", () => {
    const model = types.model("test", {
      p1: types.string,
    });

    const originalData = {
      id: "1",
      p1: "p1 string",
    };

    expect(normalize(originalData, model)).toMatchSnapshot();
  });

  test("can normalize nested entities", () => {
    const User = types.model("user", {
      id: "user 1",
      name: "ken",
    });

    const Article = types.model("article", {
      id: "article 1",
      author: User,
    });

    const input = {
      id: "123",
      author: {
        id: "8472",
        name: "Paul",
      },
    };
    expect(normalize(input, article)).toMatchSnapshot();
  });

  test('can normalize from types.maybe', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.maybe(types.string)
    })

    const input = {
      id: '12',
      name: 'ken',
    }

    const normalizedData = normalize(input, User)

    expect(normalizedData.entities.user['ken']).toEqual(input)
    expect(normalize(input, User)).toMatchSnapshot();
  })

  test('can normalize from types.optional', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string,
      age: types.optional(types.number, 20)
    })

    const input = {
      id: '',
      name: 'ken',
      age: 17
    }

    const normalizedData = normalize(input, User)

    expect(normalizedData.entities.user['ken']).toEqual(input)
    expect(normalize(input, User)).toMatchSnapshot();
  })

  test('can normalize from types.union', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string,
      gender: types.union(types.literal('male'), types.literal('female'))
    })

    const input = {
      id: '12',
      name: 'ken',
      gender: 'male'
    }

    const normalizedData = normalize(input, User)

    expect(normalizedData.entities.user['ken']).toEqual(input)
    expect(normalize(input, User)).toMatchSnapshot();
  })

  test('can normalize from types.reference', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string
    })

    const Article = types.model('article', {
      id: types.string,
      author: types.reference(User)
    })

    const input = {
      id: '12',
      author: {
        id: '23',
        name: 'ken'
      }
    }

    expect(normalize(input, Article)).toMatchSnapshot();
  })

  test('can normalize from types.array', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string
    })

    const Comment = types.model('comment', {
      id: types.string,
      comments: types.array(User)
    })

    const input = {
      id: '12',
      comments: [
        {
          id: '1',
          name: 'ben'
        },
        {
          id: '2',
          name: 'ken'
        }
      ]
    }

    const normalizedData = normalize(input, Comment)

    expect(normalize(input, User)).toMatchSnapshot();
  })
});
