/**
 * Determine if input is a js object
 *
 * @param {any} obj The object to inspect
 *
 * @returns {boolean} True if the argument appears to be an object
 */
export function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

/**
 * Determine if input is a plain object
 *
 * @param {any} obj The object to inspect
 *
 * @returns {boolean} True if the argument appears to be a plain object.
 */
export function isPlainObject(obj) {
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
