import { isModelType, isReferenceType, isLateType, isUnionType, isOptionalType, isArrayType } from 'mobx-state-tree';

/**
 * Determine if input is a js object
 *
 * @param {any} obj The object to inspect
 *
 * @returns {boolean} True if the argument appears to be an object
 */
function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
/**
 * Determine if input is a plain object
 *
 * @param {any} obj The object to inspect
 *
 * @returns {boolean} True if the argument appears to be a plain object.
 */

function isPlainObject(obj) {
  let proto = obj;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

const normalize = (input, model) => {
  return Array.isArray(input) ? normalizeFromArray(input, model) : normalizeFromObject(input, model);
};

const normalizeFromArray = (inputs, model) => {
  if (!Array.isArray(inputs) || !Array.isArray(model)) {
    throw new TypeError('Expect both input and model to be array types');
  }

  const results = [];
  const entities = {};
  const visitedEntities = [];
  inputs.forEach(input => {
    const normalizedData = normalizeFromObject(input, model[0], entities, visitedEntities);
    const {
      result
    } = normalizedData;
    results.push(result);
  });
  return {
    result: results,
    entities
  };
};

const normalizeFromObject = (input, model, entities, visitedEntities) => {
  validate(input, model);

  if (!entities) {
    entities = {};
  }

  if (!visitedEntities) {
    visitedEntities = [];
  }

  const methods = normalizeFromType(entities, visitedEntities);
  const result = methods.normalizeFromModel(input, model);
  return {
    result,
    entities
  };
};

const normalizeFromType = (entities, visitedEntities) => {
  const addEntity = addEntities(entities);
  const methods = {
    addEntity,
    visitedEntities,
    normalizeFromModel,
    normalizeFromAnyType,
    normalizeFromLateType,
    normalizeFromUnionType,
    normalizeFromArrayType,
    normalizeFromOptionalType,
    normalizeFromReferenceType
  };
  return methods;
};

function normalizeFromModel(input, model) {
  if (this.visitedEntities.some(entity => entity === input)) {
    return getIdentifierValue(input, model);
  } else {
    this.visitedEntities.push(input);
  }

  const processedEntity = {};
  model.forAllProps((name, childType) => {
    processedEntity[name] = this.normalizeFromAnyType(input[name], childType);
  });
  this.addEntity(processedEntity, model);
  return getIdentifierValue(input, model);
}

function normalizeFromArrayType(input, type) {
  if (!input) input = [];
  const subType = type._subType;
  const processedEntity = [];
  input.forEach((item, index) => {
    processedEntity[index] = this.normalizeFromAnyType(item, subType);
  });
  return processedEntity;
}

function normalizeFromOptionalType(input, type) {
  if (!input) {
    input = type.getDefaultInstanceOrSnapshot();
  }

  return this.normalizeFromAnyType(input, type._subtype);
}

function normalizeFromUnionType(input, type) {
  const realType = type.determineType(input, undefined) || type._types.find(x => isReferenceType(x));

  return this.normalizeFromAnyType(input, realType);
}

function normalizeFromLateType(input, type) {
  const realType = type.getSubType();
  return this.normalizeFromAnyType(input, realType);
}

function normalizeFromReferenceType(input, type) {
  const realType = type.targetType;
  return this.normalizeFromAnyType(input, realType);
} // This method is an entry. Find the corresponding handler by judging the mst's type of the type passed.
// It should be noted that some types may contain more than one type value.
// There is no way to uniquely identify them.At present,
// it is necessary to ensure that the execution order of the branches is judged and enter the high priority processing function.


function normalizeFromAnyType(input, type) {
  if (isLateType(type)) {
    return this.normalizeFromLateType(input, type);
  } else if (isModelType(type)) {
    return this.normalizeFromModel(input, type);
  } else if (isUnionType(type)) {
    return this.normalizeFromUnionType(input, type);
  } else if (isOptionalType(type)) {
    return this.normalizeFromOptionalType(input, type);
  } else if (isArrayType(type)) {
    return this.normalizeFromArrayType(input, type);
  } else if (isReferenceType(type)) {
    return this.normalizeFromReferenceType(input, type);
  } else {
    return input;
  }
}

const addEntities = entities => (input, model) => {
  const result = getIdentifierValue(input, model);

  if (!result) {
    return null;
  }

  const entityName = model.name;
  entities[entityName] = entities[entityName] || {};
  entities[entityName][result] = { ...entities[entityName][result],
    ...input
  };
};

const getIdentifierValue = (input, model) => {
  const entityType = model.identifierAttribute || 'id';
  return input[entityType];
};

const validate = (input, model) => {
  if (!isModelType(model)) {
    throw new Error('Invalid model');
  }

  if (!isObject(input) || !isPlainObject(input)) {
    throw new Error('Invalid input');
  }
};

export default normalize;
