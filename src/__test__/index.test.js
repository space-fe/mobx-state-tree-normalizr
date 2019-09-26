describe('normalize', () => {
  [22, null, undefined, '22', new Symbol(), true, () => { }].forEach(input => {
    test(`cannot normalize input that === ${input}`, () => {
      expect(() => normalize(input, types.model("test", {})).toThrow());
    })
  })

  test('cannot normalize without a types.model', () => {
    expect(() => normalize({})).toThrow()
    expect(() => normalize({}, Object.create())).toThrow()
  })

  test(`can initial a entity types using models`, () => {
    const model = types.model('test', {})

    const originalData = {
      id: '1'
    }

    const normalizedData = normalize(originalData, model)
    const { entities } = normalizedData;

    expect(entities['test']).toBe({})
  })

  test(`can normalizes entity`, () => {
    const model = types.model('test', {
      p1: types.string
    })

    const originalData = {
      id: '1',
      p1: 'p1 string'
    }

    expect(normalize(originalData, model)).toMatchSnapshot();
  })

  test('can normalizes nested entities', () => {
    const user = types.model('user', {
      id: 'user 1'
    })
    const comment = types.model('comment', {
      id: 'comment 1'
      user: user
    })
    const article = types.model('article', {
      id: 'article 1'
      author: user,
      comments: types.array(comment)
    })

    const input = {
      id: '123',
      title: 'A Great Article',
      author: {
        id: '8472',
        name: 'Paul'
      },
      body: 'This article is great.',
      comments: [
        {
          id: 'comment-123-4738',
          comment: 'I like it!',
          user: {
            id: '10293',
            name: 'Jane'
          }
        }
      ]
    };

    expect(normalize(input, article)).toMatchSnapshot();
})
