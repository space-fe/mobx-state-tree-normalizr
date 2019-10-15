import { isModelType, isArrayType } from 'mobx-state-tree';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function isObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    var proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto;
}

function normalize(input, model) {
    if (isObject(input)) {
        return normalizeFromObject(input, model, {});
    }
    else if (Array.isArray(input)) {
        return normalizeFromArray(input, model);
    }
    else {
        throw new TypeError('Expect input to be an array or object');
    }
}
function normalizeFromArray(inputs, model) {
    if (!Array.isArray(inputs) || !Array.isArray(model)) {
        throw new TypeError('Expect both input and model to be array types');
    }
    var results = [];
    var entities = {};
    inputs.forEach(function (input) {
        var normalizedData = normalizeFromObject(input, model[0], entities);
        var result = normalizedData.result;
        results.push(result);
    });
    return { result: results, entities: entities };
}
function normalizeFromObject(input, model, entities) {
    validateInput(input);
    validateModel(model);
    var result = getIdentifierValue(input, model);
    deepFirstSearchTraversal(input, model, entities);
    return result ? { result: result, entities: entities } : { entities: entities };
}
function deepFirstSearchTraversal(input, model, entities) {
    var addEntity = addEntities(entities);
    var modelStack = [
        {
            model: model,
            input: input
        }
    ];
    var _loop_1 = function () {
        var node = modelStack.pop();
        var model_1 = node.model;
        var input_1 = node.input;
        var currentEntity = addEntity(input_1, model_1);
        model_1.forAllProps(function (key, childType) {
            if (!input_1[key] || typeof input_1[key] !== 'object') {
                return;
            }
            if (isModelType(childType) && !childType.getSubTypes()) {
                modelStack.push(normalizeFromModel(input_1, childType, currentEntity, key));
            }
            else {
                var isArray = false;
                var isModelTypeInDeep = false;
                var realModel = null;
                var result = modelSubTypeTraversal(childType);
                for (var i = 0; i < result.length; i++) {
                    if (isArrayType(result[i])) {
                        isArray = true;
                    }
                    if (isModelType(result[i]) && !result[i]._subType) {
                        realModel = result[i];
                        isModelTypeInDeep = true;
                        break;
                    }
                }
                if (isModelTypeInDeep && isArray) {
                    modelStack.push.apply(modelStack, normalizeFromNonModel(input_1, realModel, currentEntity, key));
                }
                else if (isModelTypeInDeep && !isArray) {
                    modelStack.push(normalizeFromModel(input_1, realModel, currentEntity, key));
                }
            }
        });
    };
    while (modelStack.length) {
        _loop_1();
    }
}
function modelSubTypeTraversal(model) {
    var subType = [];
    if (!getSubType(model)) {
        return subType;
    }
    return subType.concat(getSubType(model)).reduce(function (allSubType, currentSubType) {
        return allSubType.concat(currentSubType, modelSubTypeTraversal(currentSubType));
    }, []);
}
function getSubType(model) {
    return (model._subtype || model._subType || model._types || model.targetType || (model.getSubTypes && model.getSubTypes()));
}
function normalizeFromModel(input, model, currentEntity, key) {
    var result = getIdentifierValue(input[key], model);
    if (currentEntity && result) {
        currentEntity[key] = result;
    }
    return {
        model: model,
        input: input[key]
    };
}
function normalizeFromNonModel(input, model, currentEntity, key) {
    var stack = [];
    var result = input[key].reduce(function (acc, cur) {
        acc.push(getIdentifierValue(cur, model));
        stack.push({
            model: model,
            input: cur
        });
        return acc;
    }, []);
    if (currentEntity) {
        currentEntity[key] = result;
    }
    return stack;
}
function addEntities(entities) {
    return function (input, model) {
        var result = getIdentifierValue(input, model);
        if (!result) {
            return null;
        }
        var entityName = model.name;
        if (entityName) {
            entities[entityName] = entities[entityName] || {};
            entities[entityName][result] = __assign(__assign({}, entities[entityName][result]), input);
            return entities[entityName][result];
        }
        return null;
    };
}
function getIdentifierValue(input, model) {
    var entityType = model.identifierAttribute || 'id';
    return input[entityType];
}
function validateInput(input) {
    if (!input || !isObject(input)) {
        throw new Error("Unexpected data type:" + typeof input + " given to normalize.");
    }
    if (!isPlainObject(input)) {
        throw new Error('The input data was expected to be a plain object');
    }
}
function validateModel(model) {
    if (!isModelType(model)) {
        throw new Error('The model parameter is not a model type in mobx-state-tree');
    }
}

export default normalize;
