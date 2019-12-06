import { types } from 'mobx-state-tree'

import normalize from '../src'

describe('normalize', () => {
  const typesArray = [22, null, undefined, '22', true, () => {}]
  typesArray.forEach(input => {
    test(`cannot normalize input that === ${input}`, () => {
      expect(() => normalize(input, types.model('test', {}))).toThrow()
    })
  })

  test('cannot normalize without a mobx model', () => {
    expect(() => normalize({})).toThrow()
    expect(() => normalize({}, Object.create())).toThrow()
  })

  test('cannot normalize when the model has no key of identifier type or id property by default', () => {
    const User = types.model('user', {
      name: types.string
    })

    const input = {
      name: 'ken'
    }

    expect(normalize(input, User)).toEqual({ entities: {} })
  })

  test('does not modify the original input', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string
    })

    const Article = types.model('article', {
      id: types.string,
      author: User
    })

    const input = Object.freeze({
      id: '123',
      author: Object.freeze({
        id: '12',
        name: 'Ben'
      })
    })

    expect(() => normalize(input, Article)).not.toThrow()
  })

  test('does not create an entity for a model without name property', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string
    })

    const Users = types.model({
      list: types.array(User)
    })

    const input = {
      list: [
        {
          id: '1',
          name: 'jack'
        }
      ]
    }

    expect(normalize(input, Users).result).toBe(undefined)
  })

  test('When input is an array, expect model to be an array.', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string
    })

    const input = [
      {
        id: '1',
        name: 'jack'
      }
    ]

    expect(() => normalize(input, User)).toThrow()
  })

  test('Expected input is an plain object', () => {
    const proto = {}
    const User = types.model('user', {
      id: types.string,
      name: types.string
    })
    Object.setPrototypeOf(User, proto)
    const input = {
      id: '1',
      name: 'ben'
    }
    expect(() => normalize(input, User)).toThrow()
  })

  test('can normalize entity', () => {
    const model = types.model('user', {
      id: types.identifier,
      name: types.string
    })

    const originalData = {
      id: '1',
      name: 'ben'
    }

    expect(normalize(originalData, model)).toEqual({
      result: '1',
      entities: {
        user: {
          '1': {
            id: '1',
            name: 'ben'
          }
        }
      }
    })
  })

  test('no need to normalize when a model without name property', () => {
    const User = types.model({
      id: types.string,
      name: types.string
    })

    const Article = types.model('article', {
      id: types.string,
      author: User
    })

    const input = {
      id: '123',
      author: {
        id: '8472',
        name: 'Paul'
      }
    }

    expect(normalize(input, Article)).toEqual({
      result: '123',
      entities: {
        article: {
          '123': {
            id: '123',
            author: {
              id: '8472',
              name: 'Paul'
            }
          }
        }
      }
    })
  })

  test('when the data type of input is basic type and normalize with a named model, just return the value of input', () => {
    const User = types.model('User', {
      id: types.string,
      name: types.string
    })

    const Article = types.model('article', {
      id: types.string,
      author: User
    })

    const input = {
      id: '123',
      author: 'user/1'
    }

    expect(normalize(input, Article)).toEqual({
      result: '123',
      entities: {
        article: {
          '123': {
            id: '123',
            author: 'user/1'
          }
        }
      }
    })
  })

  test('can normalize nested entity', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string
    })

    const Article = types.model('article', {
      id: types.string,
      author: User
    })

    const input = {
      id: '123',
      author: {
        id: '8472',
        name: 'Paul'
      }
    }

    expect(normalize(input, Article)).toEqual({
      result: '123',
      entities: {
        article: {
          '123': {
            id: '123',
            author: '8472'
          }
        },
        user: {
          '8472': {
            id: '8472',
            name: 'Paul'
          }
        }
      }
    })
  })

  test('can normalize when the model has a custom primary key(types.identifier type)', () => {
    const User = types.model('user', {
      name: types.identifier,
      gender: types.string
    })

    const input = {
      name: 'ben',
      gender: 'male'
    }

    expect(normalize(input, User)).toEqual({
      result: 'ben',
      entities: {
        user: {
          ben: {
            name: 'ben',
            gender: 'male'
          }
        }
      }
    })
  })

  test('can normalize array input', () => {
    const User = types.model('user', {
      id: types.identifier,
      name: types.string
    })

    const input = [
      {
        id: '1',
        name: 'ben'
      },
      {
        id: '2',
        name: 'lily'
      }
    ]

    expect(normalize(input, [User])).toEqual({
      result: ['1', '2'],
      entities: {
        user: {
          '1': {
            id: '1',
            name: 'ben'
          },
          '2': {
            id: '2',
            name: 'lily'
          }
        }
      }
    })
  })

  test('can normalize entities with circular references', () => {
    const User = types.model('users', {
      id: types.identifier,
      name: types.string,
      friend: types.maybe(types.reference(types.late(() => User)))
    })

    const input1 = {
      id: '1',
      name: 'ben'
    }

    const input2 = {
      id: '2',
      name: 'june'
    }
    input1.friend = input2
    input2.friend = input1

    expect(normalize([input1, input2], [User])).toEqual({
      result: ['1', '2'],
      entities: {
        users: {
          '1': {
            id: '1',
            name: 'ben',
            friend: '2'
          },
          '2': {
            id: '2',
            name: 'june',
            friend: '1'
          }
        }
      }
    })
  })

  test('can normalize with types.maybe', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.maybe(types.string)
    })

    const input = {
      id: '12',
      name: 'ken'
    }

    const normalizedData = normalize(input, User)

    expect(normalizedData.entities.user['12']).toEqual(input)
  })

  test('can normalize with types.optional', () => {
    const User = types.model('user', {
      id: types.string,
      name: types.string,
      age: types.optional(types.number, 20)
    })

    const input = {
      id: '1',
      name: 'ken',
      age: 17
    }

    const input2 = {
      id: '2',
      name: 'jack'
    }

    const normalizedData = normalize(input, User)

    const normalizedData2 = normalize(input2, User)

    expect(normalizedData.entities.user['1']).toEqual(input)
    expect(normalizedData2.entities.user['2'].age).toBe(20)
  })

  test('can normalize with types.union', () => {
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

    expect(normalizedData.entities.user['12']).toEqual(input)
  })

  test('can normalize with types.reference', () => {
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

    expect(normalize(input, Article)).toEqual({
      result: '12',
      entities: {
        article: {
          '12': {
            id: '12',
            author: '23'
          }
        },
        user: {
          '23': {
            id: '23',
            name: 'ken'
          }
        }
      }
    })
  })

  test('can normalize with types.array', () => {
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

    expect(normalize(input, Comment)).toEqual({
      result: '12',
      entities: {
        comment: {
          '12': {
            id: '12',
            comments: ['1', '2']
          }
        },
        user: {
          '1': {
            id: '1',
            name: 'ben'
          },
          '2': {
            id: '2',
            name: 'ken'
          }
        }
      }
    })
  })
})
