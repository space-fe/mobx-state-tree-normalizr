import { isModelType, isArrayType } from 'mobx-state-tree'
import { isObject, isPlainObject } from 'utils'

interface IResult {
  result?: string | number
  entities: object
}

interface IObject {
  [key: string]: any
}

interface IMyModelType {
  identifierAttribute?: string
  name?: string
}

interface IModelStackItem {
  model: IMyModelType
  input: IObject
}

function normalize(input: IObject, model: IMyModelType): IResult
function normalize(input: IObject[], model: IMyModelType[]): IResult[]
function normalize(input: any, model: any): any {
  if (isObject(input)) {
    return normalizeFromObject(input, model)
  } else if (Array.isArray(input)) {
    // return normalizeFromArray(input, model)
  }
}

function normalizeFromObject(input: IObject, model: IMyModelType) {
  validateInput(input)
  validateModel(model)

  const result = getPrimaryKeyValue(input, model)
  const entities = {}

  deepFirstSearchTraversal(input, model, entities)

  return result ? { result, entities } : { entities }
}

function deepFirstSearchTraversal(input: IObject, model: IMyModelType, entities: IObject) {
  const addEntity = addEntities(entities)

  const modelStack: IModelStackItem[] = [
    {
      model,
      input
    }
  ]

  while (modelStack.length) {
    const node: any = modelStack.pop()
    const model = node.model
    const input = node.input
    const currentEntity = addEntity(input, model)

    model.forAllProps((key: any, childType: any) => {
      if (!input[key] || typeof input[key] !== 'object') {
        console.log(`Property that does not exist, position: ${JSON.stringify(input)}, property: ${key}`)
        return
      }

      if (isModelType(childType) && !(childType as any).getSubTypes()) {
        modelStack.push(normalizeFromModel(input, childType, currentEntity, key))
      } else {
        let isArray = false
        let isModelTypeInDeep = false
        let realModel = null
        const result = modelSubTypeTraversal(childType)

        for (let i = 0; i < result.length; i++) {
          if (isArrayType(result[i])) {
            isArray = true
          }
          if (isModelType(result[i]) && !result[i]._subType) {
            realModel = result[i]
            isModelTypeInDeep = true
            break
          }
        }

        if (isModelTypeInDeep && isArray) {
          modelStack.push(...normalizeFromNonModel(input, realModel, currentEntity, key))
        } else if (isModelTypeInDeep && !isArray) {
          modelStack.push(normalizeFromModel(input, realModel, currentEntity, key))
        }
      }
    })
  }
}

function modelSubTypeTraversal(model: IMyModelType): any {
  const subType: any = []

  if (!getSubType(model)) {
    return subType
  }

  return subType.concat(getSubType(model)).reduce((allSubType: any, currentSubType: any) => {
    return allSubType.concat(currentSubType, modelSubTypeTraversal(currentSubType))
  }, [])
}

function getSubType(model: any) {
  return (
    model._subtype || model._subType || model._types || model.targetType || (model.getSubTypes && model.getSubTypes())
  )
}

function normalizeFromModel(input: IObject, model: IMyModelType, currentEntity: any, key: string) {
  const result = getIdentifierValue(input[key], model)
  if (currentEntity) {
    currentEntity[key] = result
  }
  return {
    model,
    input: input[key]
  }
}

function normalizeFromNonModel(input: any, model: IMyModelType, currentEntity: any, key: string) {
  const stack: IModelStackItem[] = []
  const result = input[key].reduce((acc: any, cur: any) => {
    acc.push(getIdentifierValue(cur, model))
    stack.push({
      model,
      input: cur
    })
    return acc
  }, [])

  if (currentEntity) {
    currentEntity[key] = result
  }
  return stack
}

function addEntities(entities: IObject) {
  return (input: IObject, model: IMyModelType) => {
    const result = getIdentifierValue(input, model)
    if (!result) {
      return null
    }
    const entityName = model.name
    if (entityName) {
      entities[entityName] = entities[entityName] || {}
      entities[entityName][result] = {
        ...entities[entityName][result],
        ...input
      }
      return entities[entityName][result]
    }
    return null
  }
}

function getIdentifierValue(input: IObject, model: IMyModelType) {
  const entityType = model.identifierAttribute || 'id'
  return input[entityType]
}

function getPrimaryKeyValue(input: any, model: any): string | number {
  const entityType: string = model.identifierAttribute || 'id'
  return input[entityType]
}

function validateInput(input: any) {
  if (!input || !isObject(input)) {
    throw new Error(`Unexpected data type:${typeof input} given to normalize.`)
  }
  if (!isPlainObject(input)) {
    throw new Error('the input was expected to be a plain object')
  }
}

function validateModel(model: any) {
  if (!isModelType(model)) {
    throw new Error('the model parameter is not a model type in mobx-state-tree')
  }
}

export default normalize
